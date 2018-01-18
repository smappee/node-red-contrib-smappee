const NodeConnection = require('./lib/NodeConnection')

module.exports = function (RED) {

  /**
   * Device config node
   * @param config
   * @constructor
   */
  function DeviceConfigNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.serial = config.serial
    node.host = config.host || `Smappee${node.serial}.local`
    node.uuid = config.uuid
    node.name = config.name

    // Create a MQTT connection only once per device
    node.connection = new NodeConnection(node, `ws://${node.host}:1884/mqtt`)

    // Wait for a host connection
    const hostPromise = new Promise((resolve, reject) => {
      node.connection.connect(function () {
        resolve(node.host)
      }.bind(node))
    })

    // Retrieve the service location UUID from the configuration
    const uuidPromise = new Promise((resolve, reject) => {
      const topic = `servicelocation/+/config`
      const handler = (message) => {
        node.connection.unsubscribe(topic, this)
        const uuid = message['config'] ? message['config']['serviceLocationUuid'] : null

        if (uuid) {
          node.uuid = uuid
          resolve(uuid)
        } else {
          reject('No service location UUID configured on the device')
        }
      }

      node.connection.subscribe(topic, handler)
    })

    // Functions that pass everything to the connection object
    node.subscribe = (topic, handler) => {
      hostPromise.then((host) => {
        uuidPromise.then((uuid) => {
          node.connection.subscribe(`servicelocation/${uuid}/${topic}`, handler)
        }).catch(() => {
          node.log('Failed to retrieve device UUID')
        })
      }).catch(() => {
        node.log('Failed to retrieve device host')
      })
    }

    node.publish = (topic, message) => {
      hostPromise.then((host) => {
        uuidPromise.then((uuid) => {
          node.connection.publish(`servicelocation/${uuid}/${topic}`, message)
        }).catch(() => {
          node.log('Failed to retrieve device UUID')
        })
      }).catch(() => {
        node.log('Failed to retrieve device host')
      })
    }
  }

  RED.nodes.registerType('device-config', DeviceConfigNode)

  /**
   * Plug config node
   * @param config
   * @constructor
   */
  function PlugConfigNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.uuid = config.uuid
    node.name = config.name
  }

  RED.nodes.registerType('plug-config', PlugConfigNode)

  /**
   * Device node
   * @param config
   * @constructor
   */
  function DeviceNode (config) {
    RED.nodes.createNode(this, config)

    const node = this
    const device = RED.nodes.getNode(config.device)

    if (device) {
      // Setup a subscriber to the device's config topic
      device.subscribe(`config`, node)
    }
  }

  RED.nodes.registerType('device', DeviceNode)

}
