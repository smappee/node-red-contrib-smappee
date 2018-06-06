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

  function ChargePointNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.systemNode = RED.nodes.getNode(config.chargeSystem);
    node.name = config.name;

    const chargeSystem = node.systemNode ? node.systemNode.chargeSystem : null;
    const identity = config.identity;

    if (chargeSystem && identity) {
      // Register charge point
      chargeSystem.registerChargePoint(identity, node);

      // Send a request on input
      node.on('input', function(msg) {
        const request = msg.payload;

        if (request) {
          chargeSystem.sendChargePointRequest(identity, request);
        }
      }.bind(this));

      // Close connection on closing
      node.on('close', function() {
        chargeSystem.deregisterChargePoint(identity);
      }.bind(this));
    }
  }

  RED.nodes.registerType('charge-point', ChargePointNode);
};
