const MqttClient = require('./MqttClient')

/**
 * Subscriber class for a MQTT connection to a Smappee device.
 */
class NodeConnection {
  constructor (node, broker) {
    this.node = node
    this.broker = broker
    this.messageHandlers = new Map()
  }

  connect () {
    const node = this.node

    // Return if a connection is active already
    if (this.client && this.client.isActive()) {
      return
    }

    // Create the client
    this.client = new MqttClient(this.broker)

    // Connect via MQTT
    this.client.connect(function () {
      node.log('Connected to: ' + this.broker)
    }.bind(this))

    // Disconnects the client after closing the node
    node.on('close', function () {
      if (this.client) {
        this.disconnect()
      }
    }.bind(this))

    // Bind the message handler
    this.client.handleMessage = this.handleMessage.bind(this)
  }

  disconnect () {
    this.client.disconnect()
    this.client = undefined

    this.node.log('Disconnected from: ' + this.broker)

    // Make sure the subscribed nodes show as disconnected
    for (let key of this.messageHandlers) {
      if (this.messageHandlers.hasOwnProperty(key)) {
        const handler = this.messageHandlers[key]

        if (handler) {
          handler.status({fill: 'red', shape: 'dot', text: 'node-red:common.status.disconnected'})
        }
      }
    }
  }

  /**
   * Sets a handler for each topic and then subscribes to it.
   * @param topic
   * @param node
   */
  subscribe (topic, node) {
    this.connect()

    // Keep a list of handlers
    this.messageHandlers.set(topic, node)

    node.status({fill: 'grey', shape: 'dot', text: 'node-red:common.status.connecting'})
    this.client.subscribe(topic)
  }

  /**
   * Publishes a message to a certain topic.
   * @param topic
   * @param message
   */
  publish (topic, message) {
    this.connect()

    this.client.publish(topic, message)
  }

  /**
   * Only sends the node payload if the topic is relevant.
   * @param topic
   * @param message
   */
  handleMessage (topic, message) {
    const handler = this.messageHandlers.get(topic)

    if (handler) {
      handler.status({fill: 'green', shape: 'dot', text: 'node-red:common.status.connected'})
      handler.send({payload: message})
    }
  }
}

module.exports = NodeConnection
