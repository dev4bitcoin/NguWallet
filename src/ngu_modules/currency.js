import BigNumber from 'bignumber.js';

import storage from './storage'

const PREFERRED_CURRENCY_STORAGE_KEY = 'preferredCurrency';

const defaultCurrency = {
    "endPointKey": "USD",
    "symbol": "$",
    "locale": "en-US",
    "source": "Coingecko"
}

async function getPreferredCurrency() {
    const preferredCurrency = await storage.getItem(PREFERRED_CURRENCY_STORAGE_KEY);

    if (!preferredCurrency) {
        return defaultCurrency;
    }

    return preferredCurrency;
}

async function setPreferredCurrency(item) {
    await storage.storeItem(PREFERRED_CURRENCY_STORAGE_KEY, item);
}

function satoshiToBTC(satoshi) {
    return new BigNumber(satoshi).dividedBy(100000000).toString(10);
}

function btcToSatoshi(btc) {
    return new BigNumber(btc).multipliedBy(100000000).toNumber();
}

export default {
    getPreferredCurrency,
    setPreferredCurrency,
    defaultCurrency,
    satoshiToBTC,
    btcToSatoshi
}