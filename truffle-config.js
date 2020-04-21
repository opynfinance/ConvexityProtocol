// This enables us to use TypeScript in the unit tests.
require('ts-node/register');
//const mnemonic = require('./secret.js');
//const HDWalletProvider = require('truffle-hdwallet-provider');
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
// if (process.env.NODE_ENV !== 'test') {
//   secrets = require("./secrets.json");
// }

module.exports = {
  networks: {
    coverage: {
      host: "127.0.0.1",
      port: 8555,
      network_id: "*",
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    },
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/ae145ebad7c8499db7901246fd1271f7"),
      network_id: 4,       // Rinkeby's id
      gas: 10000000,        // Rinkeby has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 2000,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,    // Skip dry run before migrations? (default: false for public nets )
      gasPrice: 7000000000  // 7 gwei (in wei) (default: 100 gwei)
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/ae145ebad7c8499db7901246fd1271f7"),
      network_id: 1,       // Mainnet id
      chain_id: 1,
      gas: 8000000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 2000,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,    // Skip dry run before migrations? (default: false for public nets )
      gasPrice: 7000000000  // 7 gwei (in wei) (default: 100 gwei)
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://kovan.infura.io/v3/ae145ebad7c8499db7901246fd1271f7");
      },
      network_id: 42,
      gas: 6700000,
      gasPrice: 10000000000
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/ae145ebad7c8499db7901246fd1271f7");
      },
      network_id: 3,
      gas: 6700000,
      gasPrice: 10000000000
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  plugins: ["solidity-coverage"],

  compilers: {
    solc: {
      version: "0.5.10",
      settings: {          
        optimizer: {
          enabled: true,
          runs: 200
        },
      }
    }
  }
}