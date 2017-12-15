module.exports = function (RED) {

  function ConnectionNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const gateway = RED.nodes.getNode(config.gateway)

    if (gateway) {
      node.status({fill: 'grey', shape: 'ring', text: 'node-red:common.status.connecting'})

      const handler = function (message) {
        node.status({fill: 'green', shape: 'dot', text: 'node-red:common.status.connected'})

        node.send({
          payload: message
        })
      }

      const criteria = {
        source: config.source,
        destination: config.destination,
        value: config.value
      }

      gateway.subscribe(handler, criteria)
    }
  }

  RED.nodes.registerType('connection', ConnectionNode)

}
