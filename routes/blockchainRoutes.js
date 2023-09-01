const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const nodeAddress = uuidv4().split("-").join("");

const router = express.Router();

module.exports = (donorChain) => {
  router.get("/blockchain", (req, res) => {
    res.status(200).json({ success: true, data: donorChain });
  });

  router.get("/consensus", async (req, res) => {
    let longestChain = null;
    let currentChainLength = donorChain.chain.length;
    for (let nodeUrl of donorChain.networkNodes) {
      const response = await axios.get(`${nodeUrl}/api/blockchain`);
      const nodeChain = response.data.data.chain;
      const nodeChainLength = nodeChain.length;
      if (
        nodeChainLength > currentChainLength &&
        donorChain.validateChain(nodeChain)
      ) {
        currentChainLength = nodeChainLength;
        longestChain = nodeChain;
      }
    }
    if (longestChain) {
      donorChain.chain = longestChain;
      res.json({ message: "Chain replaced", chain: donorChain.chain });
    } else {
      res.json({
        message: "Current chain is authoritative",
        chain: donorChain.chain,
      });
    }
  });

  router.post("/transaction/broadcast", async (req, res) => {
    const transaction = donorChain.addTransaction(
      req.body.message,
      req.body.sender,
      req.body.recipient
    );
    donorChain.addTransactionToPendingList(transaction);
    donorChain.networkNodes.forEach(async (url) => {
      await axios.post(`${url}/api/transaction`, transaction);
    });
    res
      .status(201)
      .json({ success: true, data: "Transactions are created and updated." });
  });

  router.get("/mine", async (req, res) => {
    try {
      const previousBlock = donorChain.getLastBlock();
      const previousHash = previousBlock.hash;
      const data = {
        data: donorChain.pendingList,
        index: previousBlock.index + 1,
      };
      const nonce = donorChain.proofOfWork(previousHash, data);
      const hash = donorChain.createHash(previousHash, data, nonce);
      const block = donorChain.createBlock(nonce, previousHash, hash);

      const networkPromises = donorChain.networkNodes.map((url) => {
        return axios.post(`${url}/api/block`, { block: block });
      });

      await Promise.all(networkPromises);

      await axios.post(`${donorChain.nodeUrl}/api/transaction/broadcast`, {
        message: "gg you mined a block",
        sender: "00",
        recipient: nodeAddress,
      });

      res.status(200).json({ success: true, data: block });
    } catch (error) {
      console.error("Error while mining:", error);
      res
        .status(500)
        .json({ success: false, message: "An error occurred while mining." });
    }
  });

  router.post("/donation", (req, res) => {
    const transaction = req.body;
    const { index, transactionId } =
      donorChain.addSupplyChainTransaction(transaction);
    res.status(201).json({ success: true, index, transactionId });
  });

  router.get("/validate", (req, res) => {
    const isValid = donorChain.validateChain(donorChain.chain);
    res.status(200).json({ success: true, isValid });
  });

  router.post("/register-node", (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;

    if (!donorChain.networkNodes.includes(newNodeUrl)) {
      donorChain.networkNodes.push(newNodeUrl);
      res.status(201).json({ note: "New node registered successfully." });
    } else {
      res.status(400).json({ note: "Node already registered." });
    }
  });

  router.get("/donation/:transactionID", (req, res) => {
    const transactionID = req.params.transactionID;
    const transaction = donorChain.chain
      .flatMap((block) => block.data)
      .find((tx) => tx.transactionId === transactionID);
    if (transaction) {
      res.status(200).json({ success: true, data: transaction });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
  });

  router.put("/donation/:transactionID/status", (req, res) => {
    const transactionID = req.params.transactionID;
    const newStatus = req.body.status;

    const originalTransaction = donorChain.chain
      .flatMap((block) => block.data)
      .find((tx) => tx.transactionId === transactionID);

    if (originalTransaction) {
      const newTransaction = donorChain.addSupplyChainTransaction(
        {
          donorID: originalTransaction.donorID,
          receiverID: originalTransaction.receiverID,
          donationType: originalTransaction.donationType,
          donationAmount: originalTransaction.donationAmount,
          status: newStatus,
        },
        transactionID
      );

      res.status(200).json({ success: true, data: newTransaction });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
  });

  router.get("/pending", (req, res) => {
    res.status(200).json({ success: true, data: donorChain.pendingList });
  });

  return router;
};
