const ChargeSystem = require('./lib/ChargeSystem');

module.exports = function(RED) {

  /**
   * Change system config node
   * @param config
   * @constructor
   */
  function ChargeSystemConfigNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.path = config.path;
    node.port = config.port;
    node.name = config.name;

    // Prefix path with a slash if necessary
    let nodePath = RED.settings.httpNodeRoot || '/';
    nodePath = nodePath + (nodePath.slice(-1) === '/' ? '' : '/');
    node.path = nodePath +
      (config.path.charAt(0) === '/' ? config.path.substring(1) : config.path);

    // Remove trailing slashes
    node.path = node.path.replace(/\/+$/, '');

    const options = {
      path: node.path,
      port: node.port,
    };

    if (RED.settings.webSocketNodeVerifyClient) {
      options.verifyClient = RED.settings.webSocketNodeVerifyClient;
    }

    // Create a charge system only once
    node.chargeSystem = new ChargeSystem(node, options);
  }

  RED.nodes.registerType('charge-system-config', ChargeSystemConfigNode);
};
