const config = require("./config.json");

const oToken = artifacts.require("oToken.sol");

module.exports = async function(callback) {
    try {
        if(config.set_option_details.oToken == "") {
            console.log("Specify a oToken address in the config file");
            return;
        }

        let option = await oToken.at(config.set_option_details.oToken);
        console.log("oToken address: ", option.address);
        console.log("oToken owner: ", await option.owner());

        // set oToken details
        await option.setDetails(
            config.set_option_details.name,
            config.set_option_details.symbol
        );

        let optionName = await option.name();
        let optionSymb = await option.symbol();
        let optionDecimals = await option.decimals();

        console.log("Name: ", optionName);
        console.log("Symbol: ", optionSymb);
        console.log("Decimals: ", optionDecimals);

        callback();
    }
    catch(err) {
        callback(err);
    }
}