import React, { useEffect, useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { format, fromUnixTime } from 'date-fns'

import BalanceCard from '../components/BalanceCard';
import Screen from '../components/Screen';
import { AppContext } from '../ngu_modules/appContext';
import priceApi from '../api/price'
import routes from '../navigation/routes';
import Localize from '../config/Localize';
import WalletScreen from './WalletScreen';
import currency from '../ngu_modules/currency';
import Colors from '../config/Colors';
import TopBar from '../components/TopBar';
import Notification from './Notification';

const PRICE_CHANGE_IN_LAST_24HOUR_STRING = "{CURRENCY}_24h_change";
const LAST_UPDATED = "last_updated_at";

function HomeScreen({ navigation }) {
    const { preferredFiatCurrency, setLatestPrice, showPriceCardInHomeScreen } = useContext(AppContext);
    const [price, setPrice] = useState();

    useEffect(() => {
        const willFocusSubscription = navigation.addListener('focus', () => {
            getPrice();
        });
        return willFocusSubscription;
    }, [])

    const getPrice = async () => {
        try {
            const preferredCurrency = await currency.getPreferredCurrency();
            const result = await priceApi.getLatestMarketPrice(preferredCurrency?.endPointKey);

            if (result && result.ok) {
                const currency = preferredCurrency?.endPointKey.toLowerCase();
                const coinId = priceApi.COIN_ID;

                const data = result.data[coinId];
                setPrice(data[currency]);

                const replacedString = PRICE_CHANGE_IN_LAST_24HOUR_STRING.replace("{CURRENCY}", currency);
                const formatted = data[LAST_UPDATED] ? format(fromUnixTime(data[LAST_UPDATED]), 'p') : '';
                const latestPrice = {
                    price: data[currency],
                    lastUpdatedAt: formatted,
                    priceChangeFromLast24Hour: data[replacedString]
                };
                setLatestPrice(latestPrice);
            }
        }
        catch (ex) {
            throw new Error(`${Localize.getLabel("priceErrorMessage")} ${preferredCurrency.endPointKey}: ${ex.message}`);
        }
    }

    return (
        <Screen style={styles.container}>
            <TopBar />
            {showPriceCardInHomeScreen &&
                <BalanceCard
                    preferredCurrency={preferredFiatCurrency}
                    value={price}
                    onPress={() => navigation.navigate(routes.PRICE_HISTORY)} />
            }
            <WalletScreen />
            <Notification />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    topBar: {
        flexDirection: 'row'
    },
    text: {
        fontSize: 20,
        color: Colors.white
    }
});

export default HomeScreen;