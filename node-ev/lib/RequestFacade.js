const moment = require('moment');
const MessageBuilder = require('./MessageBuilder');

class RequestFacade {

  constructor(node) {
    this.node = node;
  }

  handleRequest(request) {
    const {uniqueId, operation} = request;

    // Dynamically get the action handler
    const handler = this[`handle${operation}`];

    // Handle the request
    if (handler && typeof handler === 'function') {
      const response = handler.call(this, request);

      // Build the response object
      if (response) {
        return MessageBuilder.response(uniqueId, response);
      } else {
        return null;
      }
    }

    // Request was not handled
    return false;
  }

  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  handleBootNotification(request) {
    return {
      currentTime: new Date().toISOString(),
      interval: 60, // Heartbeat in seconds
      status: 'Accepted',
    };
  }

  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  handleAuthorize(request) {
    const expiryDate = moment().add(30, 'days');

    return {
      idTagInfo: {
        status: 'Accepted',
        expiryDate: expiryDate.toISOString(),
      },
    };
  }

  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  handleHeartbeat(request) {
    return {
      currentTime: new Date().toISOString(),
    };
  }

  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  handleMeterValues(request) {
    return {}; // Empty payload
  }

  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  handleStartTransaction(request) {
    const expiryDate = moment().add(30, 'days');

    return {
      transactionId: 1,
      idTagInfo: {
        status: 'Accepted',
        expiryDate: expiryDate.toISOString(),
      },
    };
  }

  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  handleStatusNotification(request) {
    return {}; // Empty payload
  }

  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  handleStopTransaction(request) {
    const expiryDate = moment().add(30, 'days');

    return {
      idTagInfo: {
        status: 'Accepted',
        expiryDate: expiryDate.toISOString(),
      },
    };
  }

}

module.exports = RequestFacade;
