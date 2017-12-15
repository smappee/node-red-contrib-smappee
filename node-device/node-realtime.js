module.exports = function (RED) {
  function RealtimeNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)

    if (device) {
      // Setup a subscriber to the device's realtime topic
      const topic = `servicelocation/${device.uuid}/realtime`
      device.subscribe(topic, node)
    }
  }

  RED.nodes.registerType('realtime', RealtimeNode)
}
