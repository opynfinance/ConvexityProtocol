const axios = require('axios');

const getGasPrice = async (web3, maxWait) => {
    try {
      const response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
      const data = response.data.gasPriceRange;
      const price = Object.keys(data).find(price => parseFloat(data[price]) <= maxWait);
      return web3.utils.toWei(`${(price || response.data.fast) / 10}`, 'gwei');
    } catch (error) {
      throw new Error(`Failed to fetch gas price data: ${error}`);
    }
}

module.exports = {
    getGasPrice
};
