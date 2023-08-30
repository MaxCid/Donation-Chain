const sha256 = require("sha256");
const { v4: uuidv4 } = require("uuid");
const SupplyChainTransaction = require("./supplyChainTransaction");
const { createHash, proofOfWork, validateChain } = require("./blockchainUtils");

function Blockchain() {
  this.chain = [];
  this.pendingList = [];
  this.nodeUrl = process.argv[3];
  this.networkNodes = [];
  this.createBlock(1, "Genisis", "Genisis");
}

Blockchain.prototype.createBlock = function (nonce, previousHash, hash) {
  const block = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    data: this.pendingList,
    nonce: nonce,
    hash: hash,
    previousHash: previousHash,
  };
  this.pendingList = [];
  this.chain.push(block);
  return block;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain.at(-1);
};

Blockchain.prototype.addTransaction = function (amount, sender, recipient) {
  const transaction = {
    amount,
    sender,
    recipient,
    transactionId: uuidv4().split("-").join(""),
  };
  return transaction;
};

Blockchain.prototype.addTransactionToPendingList = function (transaction) {
  this.pendingList.push(transaction);
  return this.getLastBlock().index + 1;
};

Blockchain.prototype.addSupplyChainTransaction = function (
  transaction,
  originalTransactionId = null
) {
  const newTransaction = new SupplyChainTransaction(
    transaction.donorID,
    transaction.receiverID,
    transaction.donationType,
    transaction.donationAmount,
    transaction.status,
    Date.now(),
    originalTransactionId
  );
  this.pendingList.push(newTransaction);
  return {
    index: this.getLastBlock().index + 1,
    transactionId: newTransaction.transactionId,
  };
};

Blockchain.prototype.createHash = createHash;
Blockchain.prototype.proofOfWork = proofOfWork;
Blockchain.prototype.validateChain = validateChain;

module.exports = Blockchain;
