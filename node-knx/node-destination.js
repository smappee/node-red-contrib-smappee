module.exports = function (RED) {

  function DestinationNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const gateway = RED.nodes.getNode(config.gateway)
    const destination = config.destination
    const dpt = config.dpt

    if (gateway && destination) {
      // Listen to inputs
      node.on('input', function (msg) {
        if (msg.hasOwnProperty('payload')) {
          gateway.publish(destination, msg.payload, dpt)
        }
      }.bind(node))
    }
  }

  RED.nodes.registerType('destination', DestinationNode)

}
