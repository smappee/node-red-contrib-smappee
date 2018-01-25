module.exports = function (RED) {
  function PlugStateNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)
    const plug = RED.nodes.getNode(config.plug)

    if (device && plug) {
      // Setup a subscriber to the plug's state topic
      device.subscribe(`plug/${plug.uuid}/state`, node)

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
            device.publish(`plug/${plug.uuid}/setstate`, {
              value: onState ? 'ON' : 'OFF',
              since: new Date().getTime(),
              nodeId: plug.uuid
            })
          }
        }
      }.bind(node))
    }
  }

  RED.nodes.registerType('plug-state', PlugStateNode)
}
