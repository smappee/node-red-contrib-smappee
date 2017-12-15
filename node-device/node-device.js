const NodeConnection = require('./lib/NodeConnection')

module.exports = function (RED) {

  /**
   * Device config node
   * @param config
   * @constructor
   */
  function DeviceConfigNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.host = config.host
    node.uuid = config.uuid
    node.name = config.name

    // Create a MQTT connection only once per device
    node.connection = new NodeConnection(node, `ws://${node.host}:1884/mqtt`)

    // Functions that pass everything to the connection object
    node.subscribe = (topic, handler) => node.connection.subscribe(topic, handler)
    node.publish = (topic, message) => node.connection.publish(topic, message)
  }

  RED.nodes.registerType('device-config', DeviceConfigNode)

  /**
   * Plug config node
   * @param config
   * @constructor
   */
  function PlugConfigNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.uuid = config.uuid
    node.name = config.name
  }

  RED.nodes.registerType('plug-config', PlugConfigNode)

  /**
   * Device node
   * @param config
   * @constructor
   */
  function DeviceNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)

    if (device) {
      // Setup a subscriber to the device's config topic
      const topic = `servicelocation/${device.uuid}/config`
      device.subscribe(topic, node)
    }
  }

  RED.nodes.registerType('device', DeviceNode)

}
