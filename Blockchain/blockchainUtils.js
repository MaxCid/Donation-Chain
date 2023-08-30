const sha256 = require("sha256");

const createHash = (prevHash, data, nonce) => {
  const stringToHash = prevHash + JSON.stringify(data) + nonce.toString();
  const hash = sha256(stringToHash);
  return hash;
};

const proofOfWork = (prevHash, data) => {
  let nonce = 0;
  let hash = createHash(prevHash, data, nonce);
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = createHash(prevHash, data, nonce);
  }
  return nonce;
};

const validateChain = (blockChain) => {
  let isValid = true;

  for (let i = 1; i < blockChain.length; i++) {
    const block = blockChain[i];
    const previousBlock = blockChain[i - 1];
    const hash = createHash(
      previousBlock.hash,
      { data: block.data, index: block.index },
      block.nonce
    );

    if (hash !== block.hash) {
      isValid = false;
    }

    if (block.previousHash !== previousBlock.hash) {
      isValid = false;
    }
  }

  const genesisBlock = blockChain.at(0);
  const isGenesisNonceValid = genesisBlock.nonce === 1;
  const isGenesisHashValid = genesisBlock.hash === "Genisis";
  const isGenesisPreviousHashValid = genesisBlock.previousHash === "Genisis";
  const hasNoData = genesisBlock.data.length === 0;

  if (
    !isGenesisNonceValid ||
    !isGenesisHashValid ||
    !isGenesisPreviousHashValid ||
    !hasNoData
  ) {
    isValid = false;
  }

  return isValid;
};

module.exports = { createHash, proofOfWork, validateChain };
