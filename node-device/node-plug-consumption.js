module.exports = function (RED) {
  function PlugConsumptionNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)
    const plug = RED.nodes.getNode(config.plug)

    if (device && plug) {
      // Setup a subscriber to the plug's consumption topic
      device.subscribe(`plug/${plug.uuid}/consumption`, node)
    }
  }

  RED.nodes.registerType('plug-consumption', PlugConsumptionNode)
}
