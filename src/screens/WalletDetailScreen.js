import React from 'react';
import { View, StyleSheet } from 'react-native';

import Screen from '../components/Screen';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';

function WalletDetailScreen({ route, navigation }) {
    const { id, name, balance } = route.params;
    return (
        <Screen>
            <View style={styles.container}>
                <AppText style={styles.header}>{name}</AppText>
                <View style={styles.balanceContainer}>
                    <AppText style={styles.balance}>{balance} BTC</AppText>
                </View>

            </View>
            <AppText style={styles.transactionHeader}>{Localize.getLabel('transactions')}</AppText>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.medium,
        height: 110,
        borderRadius: 5,
        //flexDirection: 'row',
        margin: 20,
    },
    header: {
        fontSize: 22,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 20,
        paddingBottom: 10,
        color: Colors.white,
    },
    balance: {
        fontSize: 24,
        fontWeight: '700',
        padding: 5,
        color: Colors.white
    },
    balanceContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 20,
        paddingLeft: 15,
    },
    transactionHeader: {
        fontSize: 24,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        color: Colors.white,
    }
});

export default WalletDetailScreen;