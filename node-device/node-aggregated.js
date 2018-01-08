module.exports = function (RED) {
  function AggregatedNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)

    if (device) {
      // Setup a subscriber to the device's aggregated topic
      device.subscribe(`aggregated5min`, node)
    }
  }

  RED.nodes.registerType('aggregated', AggregatedNode)
}
