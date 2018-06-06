const knx = require('knx');
const moment = require('moment');
const DataPointMapper = require('./DataPointMapper');

class KnxGateway {
  constructor(host, port, useTunneling) {
    this.host = host;
    this.port = port;
    this.useTunneling = useTunneling;
    this.connected = false;
    this.handlers = new Map();
  }

  connect() {
    if (!this.isConnected()) {
      this.connection = new knx.Connection({
        ipAddr: this.host,
        ipPort: this.port,
        manualConnect: true,
        handlers: {
          connected: this.onConnected.bind(this),
          event: this.onEvent.bind(this),
          error: this.onError.bind(this),
        },
      });

      this.connection.Connect();
    }
  }

  disconnect() {
    if (this.isConnected()) {
      this.connection.Disconnect();
    }
  }

  isConnected() {
    return this.connection && this.connected;
  }

  onConnected() {
    this.connected = true;
  }

  onEvent(event, source, destination, value) {
    value = DataPointMapper.getDptResult(value);

    const message = {
      datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
      event: event,
      source: source,
      destination: destination,
      value: value,
    };

    for (let [handler, criteria] of this.handlers) {
      const isMatch = KnxGateway.matchesCriteria(criteria, message);

      if (isMatch) {
        handler(message);
      }
    }
  }

  onError(status) {
    // Only log errors that have nothing to do with timing out
    if (!status.startsWith('timed out waiting for ')) {
      console.log(`KNX error: ${status}`);
    }
  }

  subscribe(handler, criteria) {
    this.connect();
    this.handlers.set(handler, criteria);
  }

  static matchesCriteria(criteria, result) {
    if (typeof criteria === 'undefined') {
      return true;
    }

    for (const key in criteria) {
      if (criteria.hasOwnProperty(key) && criteria[key]) {
        const criteriaValue = criteria[key].toString();
        const resultValue = result[key].toString();

        if (criteriaValue !== resultValue) {
          return false;
        }
      }
    }

    return true;
  }

  publish(destination, value, dpt = 0) {
    const bitLength = KnxGateway.getBitLengthForDpt(dpt);

    this.connect();
    // Parse any value to string before converting
    this.connection.writeRaw(destination, Buffer.from(`${value}`, 'hex'),
      bitLength);
  }

  static getBitLengthForDpt(dpt) {
    switch (dpt) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 4;
      case 0:
      // Fallthrough
      default:
        // Other DPTs do not require specific bit lengths
        return undefined;
    }
  }
}

module.exports = KnxGateway;
