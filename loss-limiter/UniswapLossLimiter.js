/**
 * Uniswap Loss Limiter
 * DERIBIT_API: Deribit API endpoint
 * --network: Ethereum network
 * --oToken: Opyn token ( String without '0x')
 * --deribitOption: Opshin name on deribit
 * e.g: DERIBIT_API=https://www.deribit.com/api/v2 truffle exec loss-limiter/UniswapLossLimiter.js --network mainnet --oToken 684a1d736e934a45f6f5d00c62ddf7a0b7d2064b --deribitOption ETH-15MAY20-200-P
 */
const argv = require("minimist")(process.argv.slice(), { string: ["oToken"], string: ["deribitOption"] });
const logger = require("logger");
const BigNumber = require('bignumber.js');

const { delay } = require("./delay");
const { getDeribitMarket } = require("./deribit");
const { getGasPrice } = require("./gasprice");

const UniswapFactory = artifacts.require("UniswapFactoryInterface.sol");
const UniswapExchange = artifacts.require("UniswapExchangeInterface.sol");
const oToken = artifacts.require("oToken.sol");

// get ETH/Token liqudity at a specific price
const getUniswapPrice = (ethBalance, tokenBalance, targetPrice) => {
    let constantProduct = ethBalance.multipliedBy(tokenBalance);
    let ethLiquidityPool = Math.sqrt(constantProduct.toFixed() / targetPrice)
    let tokenLiquidityPool = Math.sqrt(constantProduct.toFixed() * targetPrice)

    return [ethLiquidityPool, tokenLiquidityPool];
}

async function run(oTokenAdd, deribitOption, Logger, keepMonitoring) {
    const ethDecimals = 18;

    // get accounts
    const accounts = await web3.eth.getAccounts();
    const marketMaker = accounts[0];
    // get oToken instance
    let opynOptionContract = await oToken.at(`0x${oTokenAdd}`);
    // get uniswap factory instance
    let uniswapFactoryContract = await UniswapFactory.at("0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95")
    // get uniswap exchange for oToken address
    let uniswapExchangeAdd = await uniswapFactoryContract.getExchange(opynOptionContract.address);
    if(uniswapExchangeAdd == 0x0000000000000000000000000000000000000000) {
        throw new Error("Can't find uniswap exchange or option ", opynOptionContract.address);
    }
    // get uniswap exchange instance
    let uniswapExchangeContract = await UniswapExchange.at(uniswapExchangeAdd);
    
    Logger.info(
        "Uniswap Loss Limiter started 🕵️‍♂️  Opyn option: ", opynOptionContract.address, "Deribit option: ", deribitOption, "Uniswap exchange: ", uniswapExchangeContract.address
    );

    while(true) {
        Logger.info("Fetching price");
    
        // get option ask/bid price from Deribit
        let deribitMarket = await getDeribitMarket(deribitOption);
        if(deribitMarket == null) {
            Logger.setLevel('error');
            Logger.error('Can not get option details from Deribit market');

            continue;
        }
        let deribitBidPrice = deribitMarket.bid_price;
        let deribitAskPrice = deribitMarket.ask_price;

        Logger.info('Deribit lowest bid: ', deribitBidPrice, 'ETH');
        Logger.info('Deribit lowest ask: ', deribitAskPrice, 'ETH');

        // get opyn token decimals
        let otokenDecimals = new BigNumber(await opynOptionContract.decimals());

        // get uniswap otoken balance
        let exchangeOptionBalance = new BigNumber(await opynOptionContract.balanceOf(uniswapExchangeContract.address)).dividedBy(10**otokenDecimals.toFixed());
        Logger.info('Uniswap pool option balance: ', exchangeOptionBalance.toFixed());

        // get uniswap eth balance
        let exchangeEthBalance = new BigNumber(await web3.eth.getBalance(uniswapExchangeContract.address)).dividedBy(10**18);
        Logger.info('Uniswap pool ETH balance: ', exchangeEthBalance.toFixed());

        // get oToken to eth price
        let takerQuantityInToken = '1';
        let quoteQuantity = await uniswapExchangeContract.getTokenToEthInputPrice(takerQuantityInToken);
        let otokenEthPrice = new BigNumber(quoteQuantity.toString()).dividedBy(10**(ethDecimals - otokenDecimals.toFixed()));

        Logger.info('Option price: ', otokenEthPrice.toFixed(), 'ETH');

        // oToken price > Deribit ask price
        if(otokenEthPrice.toFixed() > deribitAskPrice) {
            Logger.info('Opyn price is above Deribit lowest ask');

            // get eth pool/token pool liquidity at desired price
            let uniswapPoolVar = getUniswapPrice(exchangeEthBalance, exchangeOptionBalance, 1/deribitAskPrice);
            Logger.info('ETH liquidity pool should be: ', uniswapPoolVar[0]);
            Logger.info('Token liquidity pool should be: ', uniswapPoolVar[1]);

            // get amount of oToken to sell
            let amountOtokenToSell = (
                new BigNumber(uniswapPoolVar[1]).minus(exchangeOptionBalance)
            ).multipliedBy(10**otokenDecimals.toFixed()).toFixed(0);

            // get amount of ETH that can be bought with the sold oToken
            let amountEthToBuy = new BigNumber(await uniswapExchangeContract.getTokenToEthInputPrice(amountOtokenToSell)).dividedBy(10**18).toFixed();

            Logger.info('Amount of oToken to sell: ', amountOtokenToSell/10**otokenDecimals);
            Logger.info('Amount of ETH to buy: ', amountEthToBuy);

            let mmTokenBalance = new BigNumber((await opynOptionContract.balanceOf(marketMaker)).toString());
            let mmEthBalance = await web3.eth.getBalance(marketMaker);
            if(amountOtokenToSell > mmTokenBalance) {
                Logger.setLevel('error');
                Logger.error('Insufficient token balance');
            }
            else if(mmEthBalance == 0) {
                Logger.setLevel('error');
                Logger.error('Insufficient ETH balance');
            }
            else {
                // approve token transfer
                await opynOptionContract.approve(uniswapExchangeContract.address, amountOtokenToSell);

                // get tx gas price
                // TODO: change this to input form user
                let gasPrice = await getGasPrice(web3, 1);
                let gasEstimation = await uniswapExchangeContract.tokenToEthSwapInput.estimateGas(
                    amountOtokenToSell,
                    '1',
                    '1651753129000'
                );
                let gasCostEstimation = gasPrice*gasEstimation;

                Logger.info('Current gas price: ', gasPrice, 'WEI');
                Logger.info('Gas cost estimation: ', String(gasCostEstimation), 'WEI', web3.utils.fromWei(String(gasCostEstimation), 'ether'), 'ETH');

                // sell oToken for ETH
                try {
                    await uniswapExchangeContract.tokenToEthSwapInput(
                        amountOtokenToSell,
                        '1',
                        '1651753129000',
                        { gasPrice: String(gasCostEstimation)}
                    );
                }
                catch(e) {
                    Logger.setLevel('error');
                    Logger.error('Failed transaction')
                }
            }
        }
        // oToken price < Deribit bid price
        else if(otokenEthPrice.toFixed() < deribitBidPrice) {
            Logger.info('Opyn price is below Deribit bid');

            // get eth pool/token pool liquidity at desired price
            let uniswapPoolVar = getUniswapPrice(exchangeEthBalance, exchangeOptionBalance, 1/deribitBidPrice);
            Logger.info('ETH liquidity pool should be: ', uniswapPoolVar[0]);
            Logger.info('Token liquidity pool should be: ', uniswapPoolVar[1]);

            // get amount of oToken to buy
            let amountOtokenToBuy = (
                exchangeOptionBalance.minus(new BigNumber(uniswapPoolVar[1]))
            ).multipliedBy(10**otokenDecimals.toFixed()).toFixed(0);

            // get amount of ETH needed to buy oToken
            let amountEthToSell = new BigNumber(await uniswapExchangeContract.getEthToTokenOutputPrice(amountOtokenToBuy)).dividedBy(10**18).toFixed();

            Logger.info('Amount of oToken to buy: ', amountOtokenToBuy/10**otokenDecimals);
            Logger.info('Amount of ETH to sell: ', amountEthToSell);

            let mmEthBalance = await web3.eth.getBalance(marketMaker);
            if(mmEthBalance < amountEthToSell) {
                Logger.setLevel('error');
                Logger.error('Insufficient ETH balance');
            }
            else {
                // get tx gas price
                // TODO: change this to input form user
                let gasPrice = await getGasPrice(web3, 1);
                let gasEstimation = await uniswapExchangeContract.ethToTokenSwapOutput.estimateGas(
                    amountOtokenToBuy,
                    '1651753129000',
                    {value: web3.utils.toWei(amountEthToSell, 'ether')}
                );
                let gasCostEstimation = gasPrice*gasEstimation;

                Logger.info('Current gas price: ', gasPrice, 'WEI');
                Logger.info('Gas cost estimation: ', String(gasCostEstimation), 'WEI', web3.utils.fromWei(String(gasCostEstimation), 'ether'), 'ETH');

                // sell ETH for oToken
                try {
                    await uniswapExchangeContract.ethToTokenSwapOutput(
                        amountOtokenToBuy,
                        '1651753129000',
                        { 
                            value: web3.utils.toWei(amountEthToSell, 'ether'),
                            gasPrice: String(gasCostEstimation)
                        }
                    );  
                }
                catch(e) {
                    Logger.setLevel('error');
                    Logger.error('Failed transaction')
                }
            }
        }

        // delay for 1min after each request
        await delay(Number(60000));

        if (!keepMonitoring) {
            break;
        }      
    }   
}

const UniswapLossLimiter = async function(callback) {
    try {
        if (!argv.oToken) {
            throw new Error("Bad input arg! Specify an `oToken` for the address of Opyn option.");
        }
        if (!argv.deribitOption) {
            throw new Error("Bad input arg! Specify a `deribitOption` as the option name on Deribit.");
        }

        const Logger = logger.createLogger();
    
        await run(argv.oToken, argv.deribitOption, Logger, true);
    } catch (err) {
        callback(err);
    }
    callback();
};
  
UniswapLossLimiter.run = run;
module.exports = UniswapLossLimiter;
