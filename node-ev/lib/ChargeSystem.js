const http = require('http');
const WebSocket = require('ws');
const RequestFacade = require('./RequestFacade');

// Supported protocols
const PROTOCOL_ONE_POINT_SIX = 'ocpp1.6';
const TYPE_REQUEST = 'request';
const TYPE_RESPONSE = 'response';

class ChargeSystem {

  constructor(node, options) {
    this.node = node;
    this.options = options;
    this.protocols = [PROTOCOL_ONE_POINT_SIX];
    this.facade = new RequestFacade(node);
    this.chargePointNodes = new Map();
    this.servers = new Map();
    this.sockets = new Map();
    this.requests = new Map();

    // Server instance
    this.server = http.createServer(function(req, res) {
      app(req, res);
    });
  }

  registerChargePoint(identity, node) {
    // Save node for output and logging
    this.chargePointNodes.set(identity, node);
    this.statusForIdentity(identity,
      {fill: 'grey', shape: 'ring', text: 'connecting'});

    // Check if a server is already open for identity
    if (this.servers.get(identity)) {
      return;
    }

    // Destructure options
    const {path, port, ...extras} = this.options;

    // Create new options
    const options = {
      path: `${path}/${identity}`,
      port: parseInt(port),
      server: this.server,
      ...extras,
    };

    // Create a new WebSocket server and open it
    const server = new WebSocket.Server(options);

    server.on('error', this.handleError.bind(this, identity));
    server.on('connection', this.handleConnection.bind(this, identity));
    this.servers.set(identity, server);
  }

  deregisterChargePoint(identity) {
    const server = this.servers.get(identity);
    const socket = this.sockets.get(identity);

    // Close socket connection
    if (socket) {
      socket.close(1000, `Deregistered charge point '${identity}'`);
      this.sockets.delete(identity);
    }

    // Close server and delete it from the last afterwards
    if (server) {
      server.close(function() {
        this.servers.delete(identity);
      }.bind(this));
    }
  }

  sendChargePointRequest(identity, request) {
    const socket = this.sockets.get(identity);

    // Deconstruct request
    const uniqueId = request[1];
    const operation = request[2];
    const payload = request[3];

    // Save the request based on ID
    this.requests.set(uniqueId, request);

    // Stringify object
    if (typeof request === 'object') {
      request = JSON.stringify(request);
    }

    // Send request over socket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(request);
      this.logForIdentity(identity,
        `Request sent for '${operation}' to '${identity}': ${JSON.stringify(
          payload)}`);
    } else {
      this.logForIdentity(identity,
        `Request not sent for operation '${operation}' to '${identity}': ${request}`);
      return false;
    }
  }

  handleConnection(identity, socket, req) {
    const remoteAddress = req.connection.remoteAddress;
    const existingSocket = this.sockets.get(identity);

    // Only accept external connections
    if (remoteAddress === '127.0.0.1') {
      return;
    }

    // Close previous connections
    if (existingSocket) {
      existingSocket.close();
    }

    this.sockets.set(identity, socket);

    socket.on('open', this.handleOpen.bind(this, identity));
    socket.on('close', this.handleClose.bind(this, identity));
    socket.on('error', this.handleError.bind(this, identity));
    socket.on('message', this.handleMessage.bind(this, identity));

    // Output connection status
    this.statusForIdentity(identity,
      {fill: 'green', shape: 'dot', text: 'connected'});
    this.logForIdentity(identity, `Connection opened to '${identity}'`);
  }

  getNodeForIdentity(identity) {
    return this.chargePointNodes.get(identity);
  }

  statusForIdentity(identity, status) {
    const node = this.getNodeForIdentity(identity);

    if (node) {
      node.status(status);
    }
  }

  sendForIdentity(identity, message) {
    const node = this.getNodeForIdentity(identity);

    if (node) {
      node.send(message);
    }
  }

  logForIdentity(identity, message) {
    const node = this.getNodeForIdentity(identity);

    if (node) {
      node.log(message);
    }
  }

  handleOpen(identity) {
    this.logForIdentity(identity, `Open '${identity}'`);
  }

  handleClose(identity) {
    this.logForIdentity(identity, `Closed connection to '${identity}'`);

    // Delete socket since there is no point keeping it now
    this.sockets.delete(identity);
  }

  handleError(identity, error) {
    this.logForIdentity(identity, `Error on '${identity}': ${error}`);
  }

  handleMessage(identity, message) {
    const result = this.interpretMessage(identity, message);

    switch (result.type) {
      case 'request':
        this.handleRequest(identity, result);
        break;
      case 'response':
        this.handleResponse(identity, result);
        break;
      case 'error':
        // TODO
        break;
    }
  }

  handleRequest(identity, request) {
    const response = this.facade.handleRequest(request);
    const socket = this.sockets.get(identity);
    const {operation, payload} = request;

    // Output request for charge point
    this.logForIdentity(identity,
      `Request received for '${operation}' from '${identity}': ${JSON.stringify(
        payload)}'`);

    // Format message
    let output = `A response was not sent for '${operation}' to '${identity}' since the connection has been closed`;

    // Determine action
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (response) {
        socket.send(JSON.stringify(response));
        output = `Response sent for '${operation}' to '${identity}': ${JSON.stringify(
          response)}`;
      } else if (response === false) {
        output = `Unmapped operation '${operation}' from '${identity}': ${JSON.stringify(
          payload)}`;
      } else {
        output = `No response sent for '${operation}' to '${identity}'`;
      }
    }

    // Log and send payload
    this.logForIdentity(identity, output);
    this.sendForIdentity(identity, {
      type: TYPE_REQUEST,
      operation,
      payload,
    });
  }

  handleResponse(identity, payload) {
    const {operation} = payload;

    // Log and send payload
    this.logForIdentity(identity,
      `Response received for '${operation}' from '${identity}': ${JSON.stringify(
        payload)}`);
    this.sendForIdentity(identity, payload);
  }

  interpretMessage(identity, message) {
    let result;

    try {
      message = JSON.parse(message);

      if (message.length === 3) {
        result = this.formatResponse(identity, message);
      } else if (message.length === 4) {
        result = ChargeSystem.formatRequest(identity, message);
      } else if (message.length === 5) {
        result = this.formatError(identity, message);
      } else {
        this.logForIdentity(identity,
          `Unknown message type for '${identity}': ${JSON.stringify(message)}`);
        result = {type: 'unknown'};
      }
    } catch (err) {
      result = {raw: message};
    }

    return result;
  }

  static formatRequest(identity, message) {
    return {
      identity: identity,
      type: 'request',
      messageTypeId: message[0],
      uniqueId: message[1],
      operation: message[2],
      payload: message[3],
    };
  }

  resetRequestOperation(message) {
    const uniqueId = message[1];
    const request = this.requests.get(uniqueId);

    // Get operation from original request
    if (request) {
      this.requests.delete(uniqueId);
      return request[2];
    }

    return 'unknown';
  }

  formatResponse(identity, message) {
    const operation = this.resetRequestOperation(message);

    return {
      identity: identity,
      type: 'response',
      messageTypeId: message[0],
      uniqueId: message[1],
      operation: operation,
      payload: message[2],
    };
  }

  formatError(identity, message) {
    const operation = this.resetRequestOperation(message);

    return {
      identity: identity,
      type: 'error',
      operation: operation,
      errorCode: message[2],
      info: message[3],
      payload: message[4],
    };
  }
}

module.exports = ChargeSystem;
