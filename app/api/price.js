import client from './client';

const marketPriceEndpoint = '/simple/price';
const historicalPriceEndpoint = '/coins/bitcoin/ohlc';

const COIN_ID = 'bitcoin';

const getLatestMarketPrice = async (preferredCurrency) => {
    const params = {
        ids: COIN_ID,
        vs_currencies: preferredCurrency,
        include_24hr_change: true,
        include_last_updated_at: true
    }
    return await client.get(marketPriceEndpoint, params);
};

const getHistoricalPrice = async (preferredCurrency, days) => {
    const params = {
        vs_currency: preferredCurrency.toLowerCase(),
        days: days
    }
    return await client.get(historicalPriceEndpoint, params);
};

export default {
    getLatestMarketPrice,
    COIN_ID,
    getHistoricalPrice
}