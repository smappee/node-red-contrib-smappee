const uuidv1 = require('uuid/v1')

module.exports = function (RED) {
  function OcppRequestNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    this.name = config.name
    this.request = config.request
    this.useInput = config.useInput
    this.payload = config.payload || {}

    node.on('input', function (msg) {
      const payload = JSON.parse(this.useInput ? msg.payload : this.payload)

      node.send({
        payload: [
          2,
          uuidv1(),
          this.request,
          payload
        ]
      })
    }.bind(this))
  }

  RED.nodes.registerType('ocpp-request', OcppRequestNode)
}
