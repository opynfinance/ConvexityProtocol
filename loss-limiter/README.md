# Uniswap Loss Limiter

## How To Use

1- Clone this repo.

2- Run `npm i`.

3- Remove the comments from the following lines in `truffle-config.js`:
```
const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".mnemonic").toString().trim();
```
4- Add mnemonic in `.mnemonic` file in the root directory

5- Run the following command from the root directory:

`DERIBIT_API=API_ENDPOINT truffle exec loss-limiter/UniswapLossLimiter.js --network ETHEREUM_NETWORK --oToken OTOKEN_ADDRESS --deribitOption DERIBIT_OPTION`
- DERIBIT_API: Deribit API endpoint
- --network: Ethereum network (mainnet, ropsten...)
- --oToken: oToken address (string) without 0x.
- --deribitOption: Option name on Deribit
  - Deribit options use the following system of naming: `ETH-DMMMYY-STRIKE-K`. STRIKE is option strike price in USD. Template K is option kind: C for call options or P for put options.

e.g: `DERIBIT_API=https://www.deribit.com/api/v2 truffle exec loss-limiter/UniswapLossLimiter.js --network mainnet --oToken 684a1d736e934a45f6f5d00c62ddf7a0b7d2064b --deribitOption ETH-15MAY20-200-P`


