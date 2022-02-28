import React, { useContext } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import currency from '../app_modules/currency';

import ListItem from '../components/ListItem';
import Screen from '../components/Screen';
import currencies from '../models/currencies.json'
import { AppContext } from '../app_modules/appContext';

const data = Object.values(currencies);

function CurrencyScreen({ route, navigation }) {
    const { setPreferredCurrency } = useContext(AppContext);

    const handleSelection = async (selectedItem) => {
        currency.setPreferredCurrency(selectedItem);
        setPreferredCurrency();
        navigation.goBack();
    }

    return (
        <Screen>
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
        </Screen>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 15,
        paddingTop: 5
    },
});

export default CurrencyScreen;