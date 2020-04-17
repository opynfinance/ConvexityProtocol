const config = require("./config.json");

const UniswapFactory = artifacts.require("UniswapFactoryInterface.sol");

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

        let uniswapFactory = await UniswapFactory.at(config.create_uniswap_exchange.uniswap_factory);
        console.log("Uniswap Factory: ", uniswapFactory.address);

        await uniswapFactory.createExchange(
            config.create_uniswap_exchange.oToken_address
        );

        let createdExchangeAddress = await uniswapFactory.getExchange(
            config.create_uniswap_exchange.oToken_address
        );

        console.log("Created exchange: ", createdExchangeAddress);

        callback();
    }
    catch(err) {
        callback(err);
    }
}