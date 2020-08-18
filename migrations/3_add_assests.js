const OptionsFactory = artifacts.require('OptionsFactory.sol');
const ERC20 = artifacts.require('ERC20.sol');

module.exports = async function (deployer) {
  // const optionsFactory = await OptionsFactory.deployed();

  // const testDAI = await deployer.deploy(ERC20);
  // const testUSDC = await deployer.deploy(ERC20);

  // const testToken1 = await deployer.deploy(ERC20);
  // const testToken2 = await deployer.deploy(ERC20);

  // // add assets
  // await optionsFactory.updateAsset('DAI', testDAI.address)
  // await optionsFactory.updateAsset('USDC', testUSDC.address)
  // await optionsFactory.updateAsset('TKN', testToken1.address)

  // // change asset
  // await optionsFactory.updateAsset('TKN', testToken2.address)

  // // delete asset
  // await optionsFactory.updateAsset('TKN')
};
