module.exports = function (RED) {
  function RealtimeNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    node.device = RED.nodes.getNode(config.device)

    if (node.device) {
      // Setup a subscriber to the device's realtime topic
      node.device.subscribe(`realtime`, node)
    }
  }

  RED.nodes.registerType('realtime', RealtimeNode)
}
