const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Blockchain = require("./Blockchain/blockchain");
const blockchainRoutes = require("./routes/blockchainRoutes");

let fetch;
import("node-fetch").then((module) => {
  fetch = module.default;
});

const app = express();
const donorChain = new Blockchain();
const PORT = process.argv[2] || 3000;
const nodeAddress = uuidv4().split("-").join("");

app.use(express.json());

app.use("/api", blockchainRoutes(donorChain));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
