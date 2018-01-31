module.exports = function (RED) {
  function PlugStateNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    node.device = RED.nodes.getNode(config.device)
    node.plug = RED.nodes.getNode(config.plug)

    if (node.device && node.plug) {
      // Setup a subscriber to the plug's state topic
      node.device.subscribe(`plug/${node.plug.uuid}/state`, node)

      // Listen to inputs
      node.on('input', function (msg) {
        if (msg.hasOwnProperty('payload')) {
          const payload = msg.payload
          let onState = typeof payload === 'object' ? payload.on : undefined

          // Support boolean payloads
          if (payload === true || payload === false) {
            onState = payload
          }

          // Publish the on or off message
          if (typeof onState !== 'undefined') {
            node.device.publish(`plug/${node.plug.uuid}/setstate`, {
              value: onState ? 'ON' : 'OFF',
              since: new Date().getTime(),
              nodeId: node.plug.uuid
            })
          }
        }
      }.bind(node))
    }
  }

  RED.nodes.registerType('plug-state', PlugStateNode)
}
