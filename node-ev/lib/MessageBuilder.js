const messageTypeId = 3;

class MessageBuilder {

  static response(uniqueId, payload) {
    return [
      messageTypeId,
      uniqueId,
      payload,
    ];
  }

}

module.exports = MessageBuilder;
