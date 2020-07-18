// import {expect} from 'chai';
// import {
//   ERC20MintableInstance,
//   oTokenInstance,
//   OptionsFactoryInstance,
//   OptionsExchangeInstance,
//   UniswapFactoryInterfaceInstance,
//   UniswapExchangeInterfaceInstance,
//   CompoundOracleInterfaceInstance,
//   MockCompoundOracleInstance,
//   OracleInstance
// } from '../build/types/truffle-types';
// import {Address} from 'cluster';

// const OptionsFactory = artifacts.require('OptionsFactory');
// const MintableToken = artifacts.require('ERC20Mintable');
// const UniswapFactory = artifacts.require('UniswapFactoryInterface');
// const UniswapExchange = artifacts.require('UniswapExchangeInterface');
// const OptionsExchange = artifacts.require('OptionsExchange.sol');
// const oToken = artifacts.require('oToken');
// // const Oracle = artifacts.require('Oracle.sol');
// const Oracle = artifacts.require('MockCompoundOracle');

// // Egs. collateral = 200 * 10^-18, strikePrice = 9 * 10^-15.
// // returns number of oTokens
// function calculateMaxOptionsToCreate(
//   collateral: number,
//   strikePrice: number,
//   collateralToStrikePrice: number
// ): number {
//   return Math.floor((collateral * collateralToStrikePrice) / (2 * strikePrice));
// }

// // Egs. oTokensSold = 200 * 10^15, strikePrice = 9 * 10^-15, apr = 2, strikeToCol = 0.01
// // returns collateral to deposit (in wei).
// function calculateETHInUniswapPool(
//   oTokensSold: number,
//   strikePrice: number,
//   apr: number,
//   strikeToCollateralPrice: number
// ): number {
//   return Math.floor(
//     (apr / 100) * strikePrice * strikeToCollateralPrice * oTokensSold * 10 ** 18
//   );
// }

// contract('OptionsContract', accounts => {
//   const creatorAddress = accounts[0];

//   // Amount of ETH to put down as collateral in Wei.
//   const ETHCollateralForOcDai = '7000000000000000000';
//   const ETHCollateralForOcUSDC = '7000000000000000000';

//   let daiAddress: string;
//   let usdcAddress: string;

//   let uniswapFactoryAddress: string;

//   let optionsExchangeAddress: string;
//   let optionsFactoryAddress: string;
//   let optionsContractAddresses: string[];
//   let oracleAddress: string;

//   const optionsContracts: oTokenInstance[] = [];
//   let optionsFactory: OptionsFactoryInstance;
//   let cUSDC: ERC20MintableInstance;
//   let uniswapFactory: UniswapFactoryInterfaceInstance;
//   let optionsExchange: OptionsExchangeInstance;
//   let oracle: OracleInstance;
//   // let oracle: MockCompoundOracleInstance

//   const windowSize = '1586995200';
//   const contractsDeployed = false;

//   before('set up contracts', async () => {
//     if ((await web3.eth.net.getId()) == 4) {
//       uniswapFactoryAddress = '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36';

//       // Rinkeby Addreesses
//       optionsExchangeAddress = '0x8D4A9aE90ECeFde56f5C2509a261DaDcdDa33CaD';
//       optionsFactoryAddress = '0x90Eab7D251A582Ab85495b0653DDF53a145d1A76';
//       optionsContractAddresses = [
//       ];
//       oracleAddress = '0x2E309F1047ceE6DC0ce14EB0a826d282f30C703A';
//     } else if ((await web3.eth.net.getId()) == 42) {
//       // Kovan Addresses
//       usdcAddress = '0x75B0622Cec14130172EaE9Cf166B92E5C112FaFF';
//       uniswapFactoryAddress = '0xD3E51Ef092B2845f10401a0159B2B96e8B6c3D30';
//     } else if ((await web3.eth.net.getId()) == 3) {
//       // Ropsten Addresses
//       usdcAddress = '0x8a9447df1FB47209D36204e6D56767a33bf20f9f';
//       uniswapFactoryAddress = '0x0865A608E75FbD2ba087d08A5C7cAabcd977C1aD';
//     } else if ((await web3.eth.net.getId()) == 1) {
//       // Mainnet Addresses
//       usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
//       uniswapFactoryAddress = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95';

//       optionsExchangeAddress = '0x5778f2824a114F6115dc74d432685d3336216017';
//       optionsFactoryAddress = '0xb529964F86fbf99a6aA67f72a27e59fA3fa4FEaC';
//       optionsContractAddresses = [
//       ];
//       oracleAddress = '0x7054e08461e3eCb7718B63540adDB3c3A1746415';
//     }
//     if (!contractsDeployed) {
//       // oracle = await Oracle.deployed();

//       // 2. Deploy our contracts
//       // Deploy the Options Exchange
//       // optionsExchange = await OptionsExchange.deployed();
//       // Deploy the Options Factory contract and add assets to it
//       // optionsFactory = await OptionsFactory.deployed();
//       optionsFactory = await OptionsFactory.at(optionsFactoryAddress);

//       // await optionsFactory.addAsset('DAI', dai.address);
//       // await optionsFactory.addAsset('USDC', usdc.address);
//       // await optionsFactory.addAsset('cDAI', cDaiAddress);
//       // await optionsFactory.addAsset('cUSDC', cUSDCAddress);

//       // Create the unexpired options contract
//       const optionsContractResult = await optionsFactory.createOptionsContract(
//         'DAI',
//         -'18',
//         'ETH',
//         -'18',
//         -'18',
//         '180',
//         -'18',
//         'DAI',
//         windowSize,
//         windowSize,
//         {from: creatorAddress, gas: '4000000'}
//       );

//       let optionsContractAddr = optionsContractResult.logs[1].args[0];
//       optionsContracts.push(await oToken.at(optionsContractAddr));

//       // console.log('Options Exchange ' + optionsExchange.address);
//       console.log('Options Factory ' + optionsFactory.address);
//       console.log('oETH ' + optionsContracts[0].address);
//       // console.log('Oracle ' + oracle.address);
//     } else {
//       optionsFactory = await OptionsFactory.at(optionsFactoryAddress);
//       optionsContracts.push(await oToken.at(optionsContractAddresses[0]));
//       optionsExchange = await OptionsExchange.at(optionsExchangeAddress);
//       oracle = await Oracle.at(oracleAddress);
//     }

//     // instantiate Uniswap Factory
//     uniswapFactory = await UniswapFactory.at(uniswapFactoryAddress);
//   });

//   describe('set symbol + names', () => {
//     it('set the symbol, name and test it is non-null', async () => {
//       // if(!contractsDeployed) {
//       let i;
//       const details = [
//         {name: 'Opyn ETH Insurance', symbol: 'oETH'},
//         {name: 'Opyn cUSDC Insurance', symbol: 'ocUSDC'}
//       ];
//       for (i = 0; i < optionsContracts.length; i++) {
//         optionsContracts[i].setDetails(details[i].name, details[i].symbol);
//       }
//       // }
//     });
//   });

//   describe('add liquidity on uniswap', () => {
//     it('owner should be able to update parameters', async () => {
//         const liquidationIncentive = 0;
//         const liquidationFactor = 500;
//         const transactionFee = 0;
//         const collateralizationRatio = 10;

//         let currentCollateralizationRatio = await optionsContracts[0].minCollateralizationRatio();
//         expect(currentCollateralizationRatio[0].toString()).to.equal('16');

//         await optionsContracts[0].updateParameters(
//           liquidationIncentive,
//           liquidationFactor,
//           transactionFee,
//           collateralizationRatio,
//           {from: creatorAddress, gas: '100000'}
//         );

//         currentCollateralizationRatio = await optionsContracts[0].minCollateralizationRatio();
//         expect(currentCollateralizationRatio[0].toString()).to.equal('10');
//       });
//     xit('should be able to create oTokens', async () => {
//       // if (!contractsDeployed) {

//         const collateral = '200000000000000000';
//         for (let i = 0; i < optionsContracts.length; i++) {
//           const numOptions = '1000000'
//           await usdc.approve(optionsContracts[i].address, '100000000000000000000');
//           const result = await optionsContracts[i].createERC20CollateralOption(
//             numOptions,
//             collateral,
//             creatorAddress
//           );

//           // Minting oTokens should emit an event correctly
//           expect(result.logs[3].event).to.equal('IssuedOTokens');
//           expect(result.logs[3].args.issuedTo).to.equal(creatorAddress);
//         }
//       // }
//     });
//   })
// })
