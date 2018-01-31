module.exports = function (RED) {
  function PresenceNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    node.device = RED.nodes.getNode(config.device)

    if (node.device) {
      // Setup a subscriber to the device's presence topic
      node.device.subscribe(`presence`, node)
    }
  }

  RED.nodes.registerType('presence', PresenceNode)
}
