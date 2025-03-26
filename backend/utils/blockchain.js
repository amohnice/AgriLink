const { Web3 } = require("web3");

// Initialize Web3 only if RPC URL is provided
const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
let web3 = null;

if (rpcUrl) {
  try {
    web3 = new Web3(rpcUrl);
    console.log("Blockchain connection initialized");
  } catch (error) {
    console.warn("Failed to initialize blockchain connection:", error.message);
  }
}

const recordTransaction = async (sender, receiver, productId, amount) => {
  if (!web3) {
    console.warn("Blockchain functionality is not configured. Transaction will not be recorded.");
    return null;
  }

  try {
    const tx = {
      from: sender,
      to: receiver,
      value: web3.utils.toWei(amount.toString(), "ether"),
    };
    const receipt = await web3.eth.sendTransaction(tx);
    return receipt.transactionHash;
  } catch (error) {
    console.error("Blockchain transaction failed:", error);
    return null;
  }
};

module.exports = { 
  web3, 
  recordTransaction,
  isEnabled: () => !!web3
};
