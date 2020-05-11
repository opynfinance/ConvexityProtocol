const axios = require('axios');

const getDeribitMarket = async (deribitOptionName) => {
    try {
        let instrumentBookSummary = (await axios.get(
            `${process.env.DERIBIT_API}/public/get_book_summary_by_instrument?instrument_name=${deribitOptionName}`
        )).data.result;  

        return instrumentBookSummary[0];
    }
    catch(e) {
        return null;
    }
}

module.exports = {
    getDeribitMarket
};
