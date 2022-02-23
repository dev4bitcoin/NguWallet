import React, { useState, useEffect } from 'react';
import currency from './currency';

export const AppContext = React.createContext();



const AppContextProvider = ({ children }) => {
    const [preferredFiatCurrency, setPreferredFiatCurrency] = useState(currency.defaultCurrency);

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
        <AppContext.Provider value={{ preferredFiatCurrency, setPreferredCurrency }}>{children}</AppContext.Provider>
    )
}

export default AppContextProvider;