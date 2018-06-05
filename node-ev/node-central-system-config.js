const CentralSystem = require('./lib/CentralSystem');

module.exports = function(RED) {

  function CentralSystemConfigNode(config) {
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

    // Create a central system only once
    node.centralSystem = new CentralSystem(node, options);
  }

  RED.nodes.registerType('central-system-config', CentralSystemConfigNode);
};
