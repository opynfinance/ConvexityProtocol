module.exports = {
    port: 8555,
    testrpcOptions: '-p 8555 -l 0xfffffffffff --allowUnlimitedContractSize',
    buildDirPath: '/build',
    dir: '.',
    providerOptions: {
      "gasLimit": 0xfffffffffff,
      "callGasLimit": 0xfffffffffff,
      "allowUnlimitedContractSize": true
    },
    silent: false,
    copyPackages: ['openzeppelin'],
    skipFiles: [
      'Migrations.sol',

      'mocks/MockOracle.sol',
      'mocks/MockERC20.sol',
      'mocks/MockCtoken.sol',
      'mocks/MockCompoundOracle.sol',
      'mocks/MockUniswapFactory.sol',
      'mocks/MockOtokensExchange.sol',
      'echidna/contracts/TestOptionsContract.sol',
      'echidna/contracts/TestOptionsExchange.sol',
      'echidna/EchidnaOptionsContract.sol'
    ]
  };
  