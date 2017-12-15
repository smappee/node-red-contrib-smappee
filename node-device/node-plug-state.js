module.exports = function (RED) {
  function PlugStateNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)
    const plug = RED.nodes.getNode(config.plug)

    if (device && plug) {
      // Setup a subscriber to the plug's state topic
      const topic = `servicelocation/${device.uuid}/plug/${plug.uuid}/state`
      device.subscribe(topic, node)

      // Listen to inputs
      node.on('input', function (msg) {
        if (msg.hasOwnProperty('payload')) {
          const payload = msg.payload
          const onState = payload.on

          // Publish the on or off message
          if (typeof onState !== 'undefined') {
            device.publish(`servicelocation/${device.uuid}/plug/${plug.uuid}/setstate`, {
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
