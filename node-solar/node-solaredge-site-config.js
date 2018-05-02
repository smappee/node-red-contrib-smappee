module.exports = function (RED) {

  function SolarEdgeSiteConfigNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.siteId = config.siteId
    node.apiKey = config.apiKey
    node.name = config.name
  }

  RED.nodes.registerType('solaredge-site-config', SolarEdgeSiteConfigNode)
}
