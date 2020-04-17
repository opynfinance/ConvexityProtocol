const config = require("./config.json");

const OptionsFactory = artifacts.require("OptionsFactory.sol");
const oToken = artifacts.require("oToken.sol");

module.exports = async function(callback) {
    try {
        if(config.create_option.options_factory == "") {
            console.log("Specify a Options factory address in the config file");
            return;
        }

        let optionsFactory = await OptionsFactory.at(config.create_option.options_factory);
        console.log("Options Factory: ", optionsFactory.address);

        let tx = await optionsFactory.createOptionsContract(
            config.create_option.collateralType,
            config.create_option.collateralExp,
            config.create_option.underlyingType,
            config.create_option.underlyingExp,
            config.create_option.oTokenExchangeExp,
            config.create_option.strikePrice,
            config.create_option.strikeExp,
            config.create_option.strikeAsset,
            config.create_option.expiry,
            config.create_option.windowSize,
            { gas: '4000000' }
        );

        let option = await oToken.at(tx.logs[1].args[0]);
        console.log("oToken address: ", option.address);
        console.log("oToken owner: ", await option.owner());

        callback();
    }
    catch(err) {
        callback(err);
    }
}