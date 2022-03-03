import React, { useState, useEffect } from 'react';
import currency from './currency';

export const AppContext = React.createContext();

const PRICE_SOURCE = "Coingecko"

const AppContextProvider = ({ children }) => {
    const [preferredFiatCurrency, setPreferredFiatCurrency] = useState(currency.defaultCurrency);
    const [latestPrice, setLatestPrice] = useState({});

    useEffect(() => {
        getPreferredCurrency();
    }, []);

    const getPreferredCurrency = async () => {
        const preferredCurrency = await currency.getPreferredCurrency();
        setPreferredFiatCurrency(preferredCurrency);
    }
    const setPreferredCurrency = () => {
        getPreferredCurrency();
    };

    return (
        <AppContext.Provider value={{ preferredFiatCurrency, setPreferredCurrency, setLatestPrice, latestPrice, PRICE_SOURCE }}>{children}</AppContext.Provider>
    )
}

export default AppContextProvider;