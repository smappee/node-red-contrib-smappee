const WebSocket = require('ws')
const RequestFacade = require('./RequestFacade')

// Supported protocols
const protocol = 'ocpp1.6'

class CentralSystem {

  constructor (node, path, RED) {
    this.node = node
    this.path = path
    this.RED = RED;
    this.protocols = [protocol]
    this.facade = new RequestFacade(node)
    this.chargePointNodes = new Map()
    this.servers = new Map()
    this.sockets = new Map()
    this.requests = new Map()
    this.serverListeners = {}
  }

  registerChargePoint (identity, node) {
    const RED = this.RED;

    // Save node for output and logging
    this.chargePointNodes.set(identity, node)

    // Check if a server is already open for identity
    if (this.servers.get(identity)) {
      return
    }

    const storeListener = function (event, listener) {
      if (event === 'error' || event === 'upgrade' || event === 'listening') {
        this.serverListeners[event] = listener
      }
    }.bind(this)

    RED.server.addListener('newListener', storeListener)

    // Create options object
    const options = {
      server: RED.server,
      path: `${this.path}/${identity}`,
    }

    if (RED.settings.webSocketNodeVerifyClient) {
      options.verifyClient = RED.settings.webSocketNodeVerifyClient;
    }

    // Create a new WebSocket server and open it
    const server = new WebSocket.Server(options)

    // Workaround https://github.com/einaros/ws/pull/253
    // Stop listening for new listener events
    RED.server.removeListener('newListener', storeListener)

    server.on('error', this.handleError.bind(this, identity))
    server.on('connection', this.handleConnection.bind(this, identity))
    this.servers.set(identity, server)
  }

  deregisterChargePoint (identity) {
    const server = this.servers.get(identity)
    const socket = this.sockets.get(identity)

    // Close socket connection
    if (socket) {
      socket.close(1000, `Deregistered charge point '${identity}'`)
      this.sockets.delete(identity)
    }

    // Close server and delete it from the last afterwards
    if (server) {
      server.close(function () {
        this.servers.delete(identity)
      }.bind(this))
    }
  }

  sendChargePointRequest (identity, request) {
    const socket = this.sockets.get(identity)

    // Deconstruct request
    const uniqueId = request[1]
    const operation = request[2]
    const payload = request[3]

    // Save the request based on ID
    this.requests.set(uniqueId, request)

    // Stringify object
    if (typeof request === 'object') {
      request = JSON.stringify(request)
    }

    // Send request over socket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(request)
      this.logForIdentity(identity, `Request sent for '${operation}' to '${identity}': ${JSON.stringify(payload)}`)
    } else {
      this.logForIdentity(identity, `Request not sent for operation '${operation}' to '${identity}': ${request}`)
      return false
    }
  }

  handleConnection (identity, socket, req) {
    const remoteAddress = req.connection.remoteAddress
    const existingSocket = this.sockets.get(identity)

    // Only accept external connections
    if (remoteAddress === '127.0.0.1') {
      return
    }

    // Close previous connections
    if (existingSocket) {
      existingSocket.close()
    }

    this.sockets.set(identity, socket)

    socket.on('open', this.handleOpen.bind(this, identity))
    socket.on('close', this.handleClose.bind(this, identity))
    socket.on('error', this.handleError.bind(this, identity))
    socket.on('message', this.handleMessage.bind(this, identity))

    // Output connection status
    this.logForIdentity(identity, `Connection opened to '${identity}'`)
  }

  sendForIdentity (identity, message) {
    const node = this.chargePointNodes.get(identity)

    if (node) {
      node.send(message)
    }
  }

  logForIdentity (identity, message) {
    const node = this.chargePointNodes.get(identity)

    if (node) {
      node.log(message)
    }
  }

  handleOpen (identity) {
    this.logForIdentity(identity, `Open '${identity}'`)
  }

  handleClose (identity) {
    this.logForIdentity(identity, `Closed connection to '${identity}'`)

    // Delete socket since there is no point keeping it now
    this.sockets.delete(identity)
  }

  handleError (identity, error) {
    this.logForIdentity(identity, `Error on '${identity}': ${error}`)
  }

  handleMessage (identity, message) {
    const result = this.interpretMessage(identity, message)

    switch (result.type) {
      case 'request':
        this.handleRequest(identity, result)
        break
      case 'response':
        this.handleResponse(identity, result)
        break
      case 'error':
        // TODO
        break
    }
  }

  handleRequest (identity, request) {
    const response = this.facade.handleRequest(request)
    const socket = this.sockets.get(identity)
    const {operation, payload} = request

    // Log incoming message for that specific charge point
    this.logForIdentity(identity, `Request received for '${operation}' from '${identity}': ${JSON.stringify(payload)}'`)

    // Output log message
    let output = `A response was not sent for '${operation}' to '${identity}' since the connection has been closed`

    if (socket && socket.readyState === WebSocket.OPEN) {
      if (response) {
        socket.send(JSON.stringify(response))
        output = `Response sent for '${operation}' to '${identity}': ${JSON.stringify(response)}`
      } else if (response === false) {
        output = `Unmapped operation '${operation}' from '${identity}': ${JSON.stringify(payload)}`
      } else {
        output = `No response sent for '${operation}' to '${identity}'`
      }
    }

    this.logForIdentity(identity, output)
  }

  handleResponse (identity, response) {
    const {operation} = response
    this.sendForIdentity(identity, response)

    // Output log message
    this.logForIdentity(identity, `Response received for '${operation}' from '${identity}': ${JSON.stringify(response)}`)
  }

  interpretMessage (identity, message) {
    let result

    try {
      message = JSON.parse(message)

      if (message.length === 3) {
        result = this.formatResponse(identity, message)
      } else if (message.length === 4) {
        result = CentralSystem.formatRequest(identity, message)
      } else if (message.length === 5) {
        result = this.formatError(identity, message)
      } else {
        this.logForIdentity(identity, `Unknown message type for '${identity}': ${JSON.stringify(message)}`)
        result = {type: 'unknown'}
      }
    } catch (err) {
      result = {raw: message}
    }

    return result
  }

  static formatRequest (identity, message) {
    return {
      identity: identity,
      type: 'request',
      messageTypeId: message[0],
      uniqueId: message[1],
      operation: message[2],
      payload: message[3]
    }
  }

  resetRequestOperation (message) {
    const uniqueId = message[1]
    const request = this.requests.get(uniqueId)

    // Get operation from original request
    if (request) {
      this.requests.delete(uniqueId)
      return request[2]
    }

    return 'unknown'
  }

  formatResponse (identity, message) {
    const operation = this.resetRequestOperation(message)

    return {
      identity: identity,
      type: 'response',
      messageTypeId: message[0],
      uniqueId: message[1],
      operation: operation,
      payload: message[2]
    }
  }

  formatError (identity, message) {
    const operation = this.resetRequestOperation(message)

    return {
      identity: identity,
      type: 'error',
      operation: operation,
      errorCode: message[2],
      info: message[3],
      payload: message[4]
    }
  }
}

module.exports = CentralSystem
