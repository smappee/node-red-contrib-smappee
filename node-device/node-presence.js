module.exports = function (RED) {
  function PresenceNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)

    if (device) {
      // Setup a subscriber to the device's presence topic
      const topic = `servicelocation/${location.uuid}/presence`
      device.subscribe(topic, node)
    }
  }

  RED.nodes.registerType('presence', PresenceNode)
}
