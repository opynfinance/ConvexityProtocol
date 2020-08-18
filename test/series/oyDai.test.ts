// import {expect} from 'chai';
// import {
//   Erc20MintableInstance,
//   OTokenInstance,
//   OptionsFactoryInstance,
//   OptionsExchangeInstance,
//   UniswapFactoryInterfaceInstance,
//   UniswapExchangeInterfaceInstance,
//   CompoundOracleInterfaceInstance,
//   MockOracleInstance,
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
// const Oracle = artifacts.require('MockOracle');

// // Egs. collateral = 200 * 10^-18, strikePrice = 9 * 10^-15.
// // returns number of oTokens

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
//   const firstRepoOwnerAddress = accounts[1];
//   const secondRepoOwnerAddress = accounts[2];

//   // Amount of ETH to put down as collateral in Wei.
//   const ETHCollateralForOcDai = '7000000000000000000';
//   const ETHCollateralForOcUSDC = '7000000000000000000';

//   let yDaiAddress: string;
//   let uniswapFactoryAddress: string;
//   let usdcAddress:string;

//   let optionsExchangeAddress: string;
//   let optionsFactoryAddress: string;
//   let optionsContractAddresses: string[];
//   let oracleAddress: string;

//   const optionsContracts: OTokenInstance[] = [];
//   let optionsFactory: OptionsFactoryInstance;
//   let yDai: Erc20MintableInstance;
//   let uniswapFactory: UniswapFactoryInterfaceInstance;
//   let optionsExchange: OptionsExchangeInstance;
//   let oracle: OracleInstance;
//   // let oracle: MockOracleInstance

//   const windowSize = 1585440000;
//   const contractsDeployed = false;

//   before('set up contracts', async () => {
//      if ((await web3.eth.net.getId()) == 1) {
//       // Mainnet Addresses
//       yDaiAddress = "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8";
//       usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
//       uniswapFactoryAddress = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95';

//       optionsExchangeAddress = '0x5778f2824a114F6115dc74d432685d3336216017';
//       optionsFactoryAddress = '0xb529964F86fbf99a6aA67f72a27e59fA3fa4FEaC';
//       optionsContractAddresses = [
//       ];
//       oracleAddress = '0x7054e08461e3eCb7718B63540adDB3c3A1746415';
//     }
//     if (!contractsDeployed) {
//       oracle = await Oracle.at(oracleAddress);
//       // 1.2 Mock Dai contract
//       yDai = await MintableToken.at(yDaiAddress);

//       // 2. Deploy our contracts
//       // Deploy the Options Exchange
//       optionsExchange = await OptionsExchange.at(optionsExchangeAddress);
//       // Deploy the Options Factory contract and add assets to it
//       optionsFactory = await OptionsFactory.at(optionsFactoryAddress);

//       await optionsFactory.updateAsset('curve-yDAI', yDai.address);

//       // Create the unexpired options contract
//       let optionsContractResult = await optionsFactory.createOptionsContract(
//         'ETH',
//         -'18',
//         'curve-yDAI',
//         -'18',
//         -'15',
//         '92',
//         -'17',
//         'USDC',
//         '1585440000',
//         windowSize,
//         {from: creatorAddress}
//       );

//       let optionsContractAddr = optionsContractResult.logs[1].args[0];
//       optionsContracts.push(await oToken.at(optionsContractAddr));

//       console.log('Options Exchange ' + optionsExchange.address);
//       console.log('Options Factory ' + optionsFactory.address);
//       console.log('oyDai ' + optionsContracts[0].address);
//       console.log('Oracle ' + oracle.address);
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
//     xit('set the symbol, name and test it is non-null', async () => {
//       // if(!contractsDeployed) {
//       let i;
//       const details = [
//         {name: 'Opyn yCurve Insurance', symbol: 'oyCurveDai'},
//       ];
//       for (i = 0; i < optionsContracts.length; i++) {
//         optionsContracts[i].setDetails(details[i].name, details[i].symbol);
//       }
//       // }
//     });
//   });

//   describe('add liquidity on uniswap', () => {
//     it('create the uniswap exchange', async () => {
//       if (!contractsDeployed) {
//         let i;
//         for (i = 0; i < optionsContracts.length; i++) {
//           await uniswapFactory.createExchange(optionsContracts[i].address);
//         }
//       }
//     });

//     it('should be able to create oTokens', async () => {
//         const collateral = '20000000000000000';
//         const strikePrices = [92 * 10 ** -17];
//         const ETHToUSDCPrice =
//           10 ** 18 / Number(await oracle.getPrice(usdcAddress));
//         for (let i = 0; i < optionsContracts.length; i++) {
//           const numOptions = (
//             calculateMaxOptionsToCreate(
//               Number(collateral) * 10 ** -18,
//               strikePrices[i],
//               ETHToUSDCPrice
//             ) - 10000
//           ).toString();
//           const result = await optionsContracts[i].createETHCollateralOption(
//             numOptions,
//             creatorAddress,
//             {
//               from: creatorAddress,
//               value: collateral
//             }
//           );

//           // Minting oTokens should emit an event correctly
//           expect(result.logs[3].event).to.equal('IssuedOTokens');
//           expect(result.logs[3].args.issuedTo).to.equal(creatorAddress);
//         }
//     });

//     it('should be able to add liquidity to Uniswap', async () => {
//         // if (!contractsDeployed) {
//           const strikePrices = [92 * 10 ** -17];
//           const apr = [0.95];
//           const USDCToETHPrice =
//             Number(await oracle.getPrice(usdcAddress)) / 10 ** 18;

//           for (let i = 0; i < optionsContracts.length; i++) {
//             const uniswapExchangeAddr = await uniswapFactory.getExchange(
//               optionsContracts[i].address
//             );

//             const uniswapExchange = await UniswapExchange.at(uniswapExchangeAddr);
//             await optionsContracts[i].approve(
//               uniswapExchangeAddr,
//               '100000000000000000000000000000'
//             );

//             const oTokens = (
//               await optionsContracts[i].balanceOf(creatorAddress)
//             ).toString();
//             const collateral = calculateETHInUniswapPool(
//               Number(oTokens),
//               strikePrices[i],
//               apr[i],
//               USDCToETHPrice
//             ).toString();
//             // assuming 1 * 10^-15 USD per oDai, 1000 * oDai * USD-ETH
//             // the minimum value of ETH is 1000000000
//             await uniswapExchange.addLiquidity(
//               '1',
//               oTokens,
//               '1000000000000000000000000',
//               {
//                 from: creatorAddress,
//                 value: collateral
//               }
//             );
//           }
//         // }
//       });

//     xit('firstExerciser should be able to exercise 10 oTokens', async () => {
//         const amtToExercise = '100000000000000';

//         await yDai.approve(
//           optionsContracts[0].address,
//           '10000000000000000000000'
//         );

//         // call exercise
//         // ensure you approve before burn
//         await optionsContracts[0].approve(
//           optionsContracts[0].address,
//           '10000000000000000000000',
//         );

//         await optionsContracts[0].exercise(
//           amtToExercise,
//           [creatorAddress]
//         );

//     })

// })

// })
