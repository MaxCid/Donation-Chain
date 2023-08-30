const Blockchain = require("../Blockchain/blockchain");
const SupplyChainTransaction = require("../Blockchain/supplyChainTransaction");
const assert = require("assert");

const donorChain = new Blockchain();

describe("Blockchain", () => {
  it("should add a new supply chain transaction", () => {
    const transaction = new SupplyChainTransaction(
      "donor1",
      "receiver1",
      "food",
      100,
      "pending",
      Date.now()
    );
    const index = donorChain.addSupplyChainTransaction(transaction);
    assert.strictEqual(index, 2); // Assuming the genesis block is at index 1
  });

  it("should validate the blockchain", () => {
    const isValid = donorChain.validateChain(donorChain.chain);
    assert.strictEqual(isValid, true);
  });

  it("should perform proof of work", function () {
    this.timeout(10000); // sets timeout to 10 seconds
    const previousBlock = donorChain.getLastBlock();
    const previousHash = previousBlock.hash;
    const data = {
      data: donorChain.pendingList,
      index: previousBlock.index + 1,
    };
    const nonce = donorChain.proofOfWork(previousHash, data);
    assert.strictEqual(typeof nonce, "number");
  });
});

describe("Integration", () => {
  it("should add, update, and retrieve a donation", () => {
    // Add a new donation
    const transaction = new SupplyChainTransaction(
      "donor1",
      "receiver1",
      "food",
      100,
      "pending",
      Date.now()
    );
    const index = donorChain.addSupplyChainTransaction(transaction);

    // Update the donation status
    const updatedTransaction = donorChain.chain
      .flatMap((block) => block.data)
      .find((tx) => tx.donorID === "donor1");

    if (updatedTransaction) {
      updatedTransaction.status = "shipped";
    } else {
      assert.fail("Transaction not found");
    }

    // Retrieve the updated donation
    const retrievedTransaction = donorChain.chain
      .flatMap((block) => block.data)
      .find((tx) => tx.donorID === "donor1");
    assert.strictEqual(retrievedTransaction.status, "shipped");
  });
});
