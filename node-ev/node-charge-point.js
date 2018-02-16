module.exports = function (RED) {
  function ChargePointNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.systemNode = RED.nodes.getNode(config.centralSystem)
    node.name = config.name

    const centralSystem = node.systemNode ? node.systemNode.centralSystem : null
    const identity = config.identity

    if (centralSystem && identity) {
      // Register charge point
      centralSystem.registerChargePoint(identity, node)

      // Send a request on input
      node.on('input', function (msg) {
        const request = msg.payload

        if (request) {
          centralSystem.sendChargePointRequest(identity, request)
        }
      }.bind(this))

      // Close connection on closing
      node.on('close', function () {
        centralSystem.deregisterChargePoint(identity)
      }.bind(this))
    }
  }

  RED.nodes.registerType('charge-point', ChargePointNode)
}
