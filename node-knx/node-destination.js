const knx = require('knx');

module.exports = function(RED) {

  function DestinationNode(config) {
    RED.nodes.createNode(this, config);

    const node = this;
    const gateway = config.gateway ?
      RED.nodes.getNode(config.gateway).gateway :
      null;
    const destination = config.destination;
    const dpt = config.dpt;

    if (gateway && destination) {
      // Connect to the gateway
      gateway.connect();

      // Create a new data point
      node.dp = new knx.Datapoint({ga: destination, dpt: dpt, autoread: true},
        gateway.connection);

      // Listen to inputs and write values
      node.on('input', function(msg) {
        if (node.dp && msg.hasOwnProperty('payload')) {
          node.dp.write(msg.payload.value || msg.payload);
        }
      }.bind(node));
    }
  }

  RED.nodes.registerType('destination', DestinationNode);

};
