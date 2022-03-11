import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import AnimatedLottieView from 'lottie-react-native';

import { WatchOnly } from '../class/wallets/watch-only';
import Screen from '../components/Screen';
import AppText from '../components/Text';
import TransactionListItem from '../components/wallet/TransactionListItem';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import balanceHelper from '../helpers/balanceHelper';


function WalletDetailScreen({ route, navigation }) {
    const { id, name, balancesByExternalIndex, balancesByInternalIndex, xPub } = route.params;
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState();
    const [loading, setLoading] = useState(false);


    const fetchTransactions = async () => {
        setLoading(true);
        const watchOnly = new WatchOnly();
        await watchOnly.fetchTransactions(xPub);
        const txs = watchOnly.getTransactions();
        setTransactions(txs);
        setLoading(false);
    }

    useEffect(() => {
        const btc = balanceHelper.computeBalance(balancesByExternalIndex, balancesByInternalIndex);
        setBalance(btc);
        fetchTransactions();

    }, [])
    return (
        <Screen>
            <View style={styles.container}>
                <AppText style={styles.header}>{name}</AppText>
                <View style={styles.balanceContainer}>
                    <AppText style={styles.balance}>{balance} BTC</AppText>
                </View>
            </View>

            <AppText style={styles.transactionHeader}>{Localize.getLabel('transactions')}</AppText>
            {loading &&
                <AnimatedLottieView
                    autoPlay
                    style={styles.lottie}
                    backgroundColor='transparent'
                    source={require("../assets/animations/bitcoinloader.json")} />
            }

            {!loading && transactions && transactions.length > 0 &&
                <FlatList
                    style={styles.list}
                    data={transactions}
                    //showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatlistContainer}
                    keyExtractor={tx => tx.txid.toString()}
                    renderItem={({ item }) => (
                        <TransactionListItem
                            time={item.time}
                            value={item.value}
                            onPress={() => console.log('transaction clicked')}
                        />
                    )}
                />
            }
            {!loading && transactions && transactions.length == 0 &&
                <View style={styles.noTransaction}>
                    <AppText style={styles.noTransactionText}>{Localize.getLabel('noTransactionsText')}</AppText>
                </View>
            }
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