import React, { useState, useEffect } from 'react';

import currency from './currency';

export const AppContext = React.createContext();

const PRICE_SOURCE = "Coingecko";

const AppContextProvider = ({ children }) => {
    const [preferredFiatCurrency, setPreferredFiatCurrency] = useState(currency.defaultCurrency);
    const [preferredBitcoinUnit, setPreferredBitcoinUnit] = useState();
    const [latestPrice, setLatestPrice] = useState({});
    const [totalWalletBalance, setTotalWalletBalance] = useState(0);

    useEffect(() => {
        getPreferredCurrency();
        getPreferredBitcoinUnit();
    }, []);

    const getPreferredCurrency = async () => {
        const preferredCurrency = await currency.getPreferredCurrency();
        setPreferredFiatCurrency(preferredCurrency);
    }

    const setPreferredCurrency = () => {
        getPreferredCurrency();
    }

    const getPreferredBitcoinUnit = async () => {
        const preferredBtcUnit = await currency.getPreferredBitcoinDenomination();
        setPreferredBitcoinUnit(preferredBtcUnit);
    }

    const setPreferredBitcoinDenomination = () => {
        getPreferredBitcoinUnit();
    }

    return (
        <AppContext.Provider value={
            {
                preferredFiatCurrency,
                setPreferredCurrency,
                getPreferredCurrency,
                totalWalletBalance,
                setTotalWalletBalance,
                setLatestPrice,
                latestPrice,
                PRICE_SOURCE,
                preferredBitcoinUnit,
                setPreferredBitcoinDenomination
            }
        }>{children}</AppContext.Provider>
    )
}

export default AppContextProvider;