import BigNumber from 'bignumber.js';
import common from '../config/common';

import storage from './storage'

const PREFERRED_CURRENCY_STORAGE_KEY = 'preferredCurrency';
const PREFERRED_BITCOIN_DENOMINATION = 'preferredBitcoinDenomination'

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

async function getPreferredBitcoinDenomination() {
    const preferredBtcDenomination = await storage.getItem(PREFERRED_BITCOIN_DENOMINATION);
    if (!preferredBtcDenomination) {
        return common.getDefaultBitcoinDenomination();
    }

    return preferredBtcDenomination;
}

async function setPreferredBitcoinDenomination(item) {
    await storage.storeItem(PREFERRED_BITCOIN_DENOMINATION, item);
}


function satoshiToBTC(satoshi) {
    return new BigNumber(satoshi).dividedBy(100000000).toString(10);
}

// function btcToSatoshi(btc) {
//     return new BigNumber(btc).multipliedBy(100000000).toNumber();
// }

function satoshiToMBTC(satoshi) {
    return new BigNumber(btc).multipliedBy(100000000).toNumber();
}

function satoshiToBits(satoshi) {
    return new BigNumber(btc).multipliedBy(100000000).toNumber();
}

export default {
    getPreferredCurrency,
    setPreferredCurrency,
    defaultCurrency,
    satoshiToBTC,
    satoshiToMBTC,
    satoshiToBits,
    getPreferredBitcoinDenomination,
    setPreferredBitcoinDenomination
}