import { useContext } from 'react';
import storage from './storage'

const PREFERRED_CURRENCY_STORAGE_KEY = 'preferredCurrency';
const DEFAULT_CURRENCY = "USD"

const defaultCurrency = {
    "endPointKey": "USD",
    "symbol": "$",
    "locale": "en-US",
    "source": "CoinDesk"
}

async function getPreferredCurrency() {
    const preferredCurrency = await storage.getItem(PREFERRED_CURRENCY_STORAGE_KEY);

    if (!preferredCurrency) {
        return defaultCurrency;
    }

    return preferredCurrency;
}

async function setPreferredCurrency(item) {
    console.log(item);
    await storage.storeItem(PREFERRED_CURRENCY_STORAGE_KEY, item);
}

export default {
    getPreferredCurrency,
    setPreferredCurrency,
    defaultCurrency
}