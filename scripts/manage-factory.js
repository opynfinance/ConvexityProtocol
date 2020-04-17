const config = require("./config.json");

const OptionsFactory = artifacts.require("OptionsFactory.sol");

var argv = require('minimist')(process.argv.slice(2));

module.exports = async function(callback) {
    if(config.manage_factory.options_factory == "") {
        console.log("Specify a Options factory address in the config file");
        return;
    }
    if(config.manage_factory.asset == "" || config.manage_factory.address == "") {
        console.log("Specify an asset symbol and address in the config file");
        return;
    }

    let optionsFactory = await OptionsFactory.at(config.manage_factory.options_factory);
    console.log("Options Factory: ", optionsFactory.address);
    console.log("Owner: ", await optionsFactory.owner());

    switch(argv.m) {
        case 'add-asset':
            try {
                await optionsFactory.addAsset(
                    config.manage_factory.asset,
                    config.manage_factory.address
                )
                console.log("done.");

                callback();
            }
            catch(err) {
                callback(err);
            }
            break;
        case 'change-asset':
            try {
                await optionsFactory.changeAsset(
                    config.manage_factory.asset,
                    config.manage_factory.address
                )
                console.log("done.");

                callback();
            }
            catch(err) {
                callback(err);
            }
            break;
        case 'delete-asset':
            try {
                await optionsFactory.deleteAsset(
                    config.manage_factory.asset
                )
                console.log("done.");

                callback();
            }
            catch(err) {
                callback(err);
            }
            break;
        default:
            callback();
    }

    
}