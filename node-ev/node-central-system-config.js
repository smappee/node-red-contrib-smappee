const CentralSystem = require('./lib/CentralSystem')

module.exports = function (RED) {

  function CentralSystemConfigNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.path = config.path
    node.name = config.name

    // Prefix path with a slash if necessary
    let nodePath = RED.settings.httpNodeRoot || '/'
    nodePath = nodePath + (nodePath.slice(-1) === '/' ? '' : '/')
    node.path = nodePath + (config.path.charAt(0) === '/' ? config.path.substring(1) : config.path)

    // Remove trailing slashes
    node.path = node.path.replace(/\/+$/, '')

    // Create a central system only once
    node.centralSystem = new CentralSystem(node, node.path, RED)
  }

  RED.nodes.registerType('central-system-config', CentralSystemConfigNode)
}
