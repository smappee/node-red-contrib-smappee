module.exports = function(RED) {

  /**
   * Change point node
   * @param config
   * @constructor
   */
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
