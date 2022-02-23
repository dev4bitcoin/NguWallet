import React, { useEffect, useContext, useState } from 'react';
import { StyleSheet } from 'react-native';

import Card from '../components/Card';
import Screen from '../components/Screen';
import OptionsButton from '../navigation/OptionsButton';
import { AppContext } from '../app_modules/appContext';
import priceApi from '../api/price'
import routes from '../navigation/routes';

const PRICE_CHANGE_IN_LAST_24HOUR_STRING = "{CURRENCY}_24h_change";

function HomeScreen({ navigation }) {
    const { preferredFiatCurrency } = useContext(AppContext);
    const [price, setPrice] = useState();
    const [priceChangeFromLast24Hour, setPriceChangeFromLast24Hour] = useState();

    useEffect(() => {
        getPrice();
    })

    const getPrice = async () => {
        try {
            const result = await priceApi.getLatestMarketPrice(preferredFiatCurrency.endPointKey);

            if (result && result.ok) {
                const currency = preferredFiatCurrency.endPointKey.toLowerCase();
                const coinId = priceApi.COIN_ID;

                const data = result.data[coinId];
                setPrice(data[currency]);

                const replacedString = PRICE_CHANGE_IN_LAST_24HOUR_STRING.replace("{CURRENCY}", currency);
                setPriceChangeFromLast24Hour(data[replacedString]);
            }
        }
        catch (ex) {
            throw new Error(`Could not update rate for ${preferredFiatCurrency.endPointKey}: ${ex.message}`);
        }
    }

    return (
        <Screen style={styles.container}>
            <OptionsButton onPress={() => navigation.navigate(routes.SETTINGS)} />
            <Card
                preferredCurrency={preferredFiatCurrency}
                value={price}
                onPress={() => navigation.navigate(routes.PRICE_HISTORY, { price: price, priceChangeFromLast24Hour: priceChangeFromLast24Hour })} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

export default HomeScreen;