const { v4: uuidv4 } = require("uuid");

class SupplyChainTransaction {
  constructor(
    donorID,
    receiverID,
    donationType,
    donationAmount,
    status,
    timestamp,
    originalTransactionId = null
  ) {
    this.transactionId = uuidv4().split("-").join("");
    this.donorID = donorID;
    this.receiverID = receiverID;
    this.donationType = donationType;
    this.donationAmount = donationAmount;
    this.status = status;
    this.timestamp = timestamp;
    this.originalTransactionId = originalTransactionId;
  }
}

module.exports = SupplyChainTransaction;
