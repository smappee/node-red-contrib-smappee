module.exports = function (RED) {
  function AggregatedSwitchNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    node.device = RED.nodes.getNode(config.device)

    if (node.device) {
      // Setup a subscriber to the device's aggregated switch topic
      node.device.subscribe(`aggregatedSwitch`, node)
    }
  }

  RED.nodes.registerType('aggregated-switch', AggregatedSwitchNode)
}
