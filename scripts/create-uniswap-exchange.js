/**
 * script to create a uniswap exchange and add liquidity into it
 */
const config = require("./config.json");

const UniswapFactory = artifacts.require("UniswapFactoryInterface.sol");
const UniswapExchange = artifacts.require("UniswapExchangeInterface.sol");

module.exports = async function(callback) {
    try {
        if(config.create_uniswap_exchange.uniswap_factory == "") {
            console.log("Specify a Uniswap factory address in the config file");
            return;
        }
        if(config.create_uniswap_exchange.oToken_address == "") {
            console.log("Specify a oToken address in the config file");
            return;
        }

        // get uniswap factory
        let uniswapFactory = await UniswapFactory.at(config.create_uniswap_exchange.uniswap_factory);
        console.log("Uniswap Factory: ", uniswapFactory.address);

        // create exchange
        await uniswapFactory.createExchange(
            config.create_uniswap_exchange.oToken_address
        );

        // get exchange instance
        let createdExchangeAddress = await uniswapFactory.getExchange(
            config.create_uniswap_exchange.oToken_address
        );

        let uniswapExchange = await UniswapExchange.at(createdExchangeAddress);

        console.log("Created exchange: ", uniswapExchange.address);

        // add liquidity
        const oneMonthInSeconds = 60 * 60 * 24 * 30;
        const now = new Date().getTime() / 1000;
      
        await uniswapExchange.addLiquidity(
            0,
            config.create_uniswap_exchange.token_liquidity,
            parseInt(now + oneMonthInSeconds),
            { 
                value: web3.utils.toWei(config.create_uniswap_exchange.eth_liquidity, 'ether')            
            }
        );

        callback();
    }
    catch(err) {
        callback(err);
    }
}