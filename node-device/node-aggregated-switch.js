module.exports = function (RED) {
  function AggregatedSwitchNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)

    if (device) {
      // Setup a subscriber to the device's aggregated switch topic
      device.subscribe(`aggregatedSwitch`, node)
    }
  }

  RED.nodes.registerType('aggregated-switch', AggregatedSwitchNode)
}
