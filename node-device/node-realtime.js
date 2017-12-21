module.exports = function (RED) {
  function RealtimeNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)

    if (device) {
      // Setup a subscriber to the device's realtime topic
      device.subscribe(`realtime`, node)
    }
  }

  RED.nodes.registerType('realtime', RealtimeNode)
}
