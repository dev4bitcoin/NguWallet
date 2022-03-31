import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

import { WatchOnly } from '../class/wallets/watch-only';
import Screen from '../components/Screen';
import AppText from '../components/Text';
import TransactionListItem from '../components/wallet/TransactionListItem';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import currency from '../ngu_modules/currency';

function WalletDetailScreen({ route, navigation }) {
    const { id, name, balance, txsByInternalIndex, txsByExternalIndex } = route.params;
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransactions = async () => {
        const btc = currency.satoshiToBTC(balance);
        setWalletBalance(btc);

        setLoading(true);
        const watchOnly = new WatchOnly();
        await watchOnly.assignLocalVariablesIfWalletExists(id);
        const externalTxs = JSON.parse(txsByExternalIndex);
        const internalTxs = JSON.parse(txsByInternalIndex);
        if ((Object.keys(externalTxs).length === 0 && externalTxs.constructor === Object) &&
            (Object.keys(internalTxs).length === 0 && internalTxs.constructor === Object)) {
            await watchOnly.fetchTransactions(id);
        }
        const txs = watchOnly.getTransactions();
        setTransactions(txs);
        setLoading(false);
    }

    const refreshTransactions = async () => {
        setRefreshing(true);

        const watchOnly = new WatchOnly();
        await watchOnly.assignLocalVariablesIfWalletExists(id);

        const walletBalance = await watchOnly.fetchBalance(id);
        const btc = currency.satoshiToBTC(walletBalance);
        setWalletBalance(btc);

        await watchOnly.fetchTransactions(id);
        const txs = watchOnly.getTransactions();
        setTransactions(txs);

        setRefreshing(false);
    }

    useEffect(() => {
        fetchTransactions();
    }, [])
    return (
        <Screen>
            <View style={styles.container}>
                <AppText style={styles.header}>{name}</AppText>
                <View style={styles.balanceContainer}>
                    <AppText style={styles.balance}>{walletBalance} BTC</AppText>
                </View>
            </View>

            <AppText style={styles.transactionHeader}>{Localize.getLabel('transactions')}</AppText>
            {loading &&
                <ActivityIndicator size="large" />
            }

            {transactions && transactions.length > 0 &&
                <FlatList
                    style={styles.list}
                    data={transactions}
                    contentContainerStyle={styles.flatlistContainer}
                    keyExtractor={tx => tx.txid.toString()}
                    renderItem={({ item }) => (
                        <TransactionListItem
                            time={item.time}
                            value={item.value}
                            onPress={() => console.log('transaction clicked')}
                        />
                    )}
                    refreshControl={<RefreshControl
                        colors={[Colors.white]}
                        tintColor={Colors.white}
                        refreshing={refreshing}
                        onRefresh={refreshTransactions} />}
                />
            }
            {transactions && transactions.length == 0 &&
                <View style={styles.noTransaction}>
                    <AppText style={styles.noTransactionText}>{Localize.getLabel('noTransactionsText')}</AppText>
                </View>
            }
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.watchOnly,
        height: 110,
        borderRadius: 5,
        //flexDirection: 'row',
        margin: 20,
        borderColor: Colors.white,
        borderWidth: 0.5,
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
    },
    noTransaction: {
        paddingTop: 50,
        justifyContent: 'center',
    },
    noTransactionText: {
        color: Colors.textGray,
        textAlign: 'center',
    },
    lottie: {
        zIndex: 1,
        opacity: 0.9,
        height: 400,
    },
    flatlistContainer: {
        paddingBottom: 220
    }
});

export default WalletDetailScreen;