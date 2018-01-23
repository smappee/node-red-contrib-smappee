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

  connect (callback = this.connectCallback.bind(this)) {
    const node = this.node

    // Return if a connection is active already
    if (this.client && this.client.isActive()) {
      return
    }

    // Create the client
    this.client = new MqttClient(this.broker)

    // Connect via MQTT
    this.client.connect(callback)

    // Disconnects the client after closing the node
    node.on('close', function () {
      if (this.client) {
        this.disconnect()
      }
    }.bind(this))

    // Bind the message handler
    this.client.handleMessage = this.handleMessage.bind(this)
  }

  connectCallback () {
    this.node.log('Connected to: ' + this.broker)
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
          handler.status({fill: 'red', shape: 'dot', text: 'disconnected'})
        }
      }
    }
  }

  /**
   * Sets a handler for each topic and then subscribes to it.
   * @param topic
   * @param handler
   */
  subscribe (topic, handler) {
    this.connect()

    // Keep a list of handlers
    this.messageHandlers.set(topic, (this.messageHandlers.get(topic) || []).concat(handler))

    // Set the status if possible
    if (typeof handler === 'object' && handler.status) {
      handler.status({fill: 'grey', shape: 'dot', text: 'connecting'})
    }

    this.client.subscribe(topic)
  }

  /**
   * Unsubscribes a handler from a certain topic
   * @param topic
   * @param handler
   */
  unsubscribe (topic, handler) {
    const handlers = this.messageHandlers.get(topic)
    const index = handlers.indexOf(handler)

    if (index > -1) {
      this.messageHandlers.set(topic, handlers.splice(index, 1))
    }
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
    let handlers = this.messageHandlers.get(topic) || []

    // Consider handlers that listen to wildcards
    for (let [key, value] of this.messageHandlers) {
      if (key.indexOf('+') !== -1 || key.indexOf('#') !== -1) {
        const regex = new RegExp(key.replace(/\+|#/, '.*'))

        // See if the topic matches the regular expression
        if (regex.test(topic)) {
          handlers = handlers.concat(value)
        }
      }
    }

    // Loop over the handlers
    for (let handler of handlers) {
      if (typeof handler === 'function') {
        handler(message)
      } else if (typeof handler === 'object') {
        handler.status({fill: 'green', shape: 'dot', text: 'connected'})
        handler.send({payload: message})
      }
    }
  }
}

module.exports = NodeConnection
