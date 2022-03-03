import React, { useContext } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';


import currency from '../app_modules/currency';
import ListItem from '../components/ListItem';
import Screen from '../components/Screen';
import currencies from '../models/currencies.json'
import { AppContext } from '../app_modules/appContext';
import AppText from '../components/Text';
import i18n from '../config/i18n';

const data = Object.values(currencies);

function CurrencyScreen({ route, navigation }) {
    const { setPreferredCurrency, latestPrice, PRICE_SOURCE } = useContext(AppContext);

    const handleSelection = async (selectedItem) => {
        currency.setPreferredCurrency(selectedItem);
        setPreferredCurrency();
        navigation.goBack();
    }

    return (
        <Screen style={styles.container}>
            <View style={styles.listHolder}>
                <FlatList
                    style={styles.list}
                    data={data}
                    keyExtractor={currency => currency.endPointKey.toString()}
                    showsVerticalScrollIndicator={true}
                    renderItem={({ item }) => (
                        <ListItem
                            title={`${item.endPointKey} (${item.symbol})`}
                            subTitle={item.subTitle}
                            onPress={() => handleSelection(item)}
                            showChevrons={false}
                            selected={item.endPointKey === route.params.endPointKey}
                        />
                    )}
                />
            </View>
            <View style={styles.sourceHolder}>
                <AppText style={styles.source}>{i18n.t('priceObtainedFrom')} {PRICE_SOURCE}</AppText>
                <AppText style={styles.source}>{i18n.t('lastUpdatedAt')} {latestPrice?.lastUpdatedAt}</AppText>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    listHolder: {
        height: '85%'
    },
    list: {
        padding: 15,
        paddingTop: 5,

    },
    sourceHolder: {
        height: '15%'
    },
    source: {
        fontSize: 16,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 15,
        color: '#6d767f',
    }
});

export default CurrencyScreen;