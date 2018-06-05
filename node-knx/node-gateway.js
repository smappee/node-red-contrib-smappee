const KnxGateway = require('./lib/KnxGateway');

module.exports = function(RED) {

  function GatewayConfigNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.host = config.host;
    node.port = config.port;
    node.useTunneling = config.useTunneling;
    node.name = config.name;

    // Create a gateway only once
    node.gateway = new KnxGateway(node.host, node.port, node.useTunneling);

    // Functions that pass everything to the gateway object
    node.subscribe = (handler, criteria) => node.gateway.subscribe(handler,
      criteria);
    node.publish = (
      source, payload, bitLength, callback) => node.gateway.publish(source,
      payload, bitLength, callback);
  }

  RED.nodes.registerType('gateway-config', GatewayConfigNode);

};
