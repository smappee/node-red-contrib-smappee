const mqtt = require('mqtt');

class MqttClient {
  constructor(host) {
    this.broker = host;
    this.connecting = false;
  }

  connect(callback = undefined) {
    if (this.isActive()) {
      // Execute the callback immediately because
      callback();
      return;
    } else if (this.isConnecting()) {
      // Add the callback listener and return because the connection is being established
      this.client(on, 'connect', callback);
      return;
    }

    this.client = mqtt.connect(this.broker, {
      clientId: 'node-red-' + Math.random().toString(16).substr(2, 8),
    });

    // Set the client to connecting
    this.connecting = true;
    this.client.on('connect', function() {
      this.connecting = false;
    }.bind(this));

    // Add the required callback
    this.client.on('connect', callback);

    this.client.on('message', function(topic, message) {
      this.handleJsonMessage.call(this, topic, message);
    }.bind(this));
  }

  disconnect() {
    if (this.client && this.client.connected) {
      this.client.end();
    }
  }

  handleJsonMessage(topic, message) {
    const json = JSON.parse(message.toString());
    this.handleMessage(topic, json);
  }

  /**
   * Handle messages. This should be implemented by the subclass.
   * @param topic
   * @param message
   */
  handleMessage(topic, message) {
    // Implemented by subclasses.
  }

  subscribe(topic, options = null, callback = null) {
    this.client.subscribe(topic, options, callback);
  }

  publish(topic, message = '{}') {
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }

    this.client.publish(topic, message);
  }

  isActive() {
    return (this.isConnected() && !this.isDisconnecting()) ||
      this.isConnecting();
  }

  isConnected() {
    if (this.client) {
      return this.client.connected;
    }

    return false;
  }

  isConnecting() {
    return this.client && this.connecting;
  }

  isDisconnecting() {
    if (this.client) {
      return this.client.disconnecting;
    }

    return false;
  }
}

module.exports = MqttClient;
