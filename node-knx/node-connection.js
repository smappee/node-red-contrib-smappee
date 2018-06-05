module.exports = function(RED) {

  function ConnectionNode(config) {
    RED.nodes.createNode(this, config);

    const node = this;
    const gateway = RED.nodes.getNode(config.gateway);

    if (gateway) {
      node.status({fill: 'grey', shape: 'ring', text: 'connecting'});

      const handler = function(message) {
        node.status({fill: 'green', shape: 'dot', text: 'connected'});

        node.send({
          payload: message,
        });
      };

      const criteria = {
        source: config.source,
        destination: config.destination,
        value: config.value,
      };

      gateway.subscribe(handler, criteria);
    }
  }

  RED.nodes.registerType('connection', ConnectionNode);

};
