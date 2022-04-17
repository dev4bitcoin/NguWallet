import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import walletType from '../class/wallets/walletType';

import Screen from '../components/Screen';
import AppText from '../components/Text';
import TransactionButtons from '../components/TransactionButtons';
import TransactionListItem from '../components/wallet/TransactionListItem';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import unitConverter from '../helpers/unitConverter';
import walletDiscovery from '../helpers/walletDiscovery';
import ActionButton from '../components/ActionButton';
import routes from '../navigation/routes';
import { AppContext } from '../ngu_modules/appContext';

function WalletDetailScreen({ route, navigation }) {
    const { id, name, balance, type, txsByInternalIndex, txsByExternalIndex } = route.params;
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [derivationPath, setDerivationPath] = useState();
    const [walletName, setWalletName] = useState(name);
    const { preferredBitcoinUnit } = useContext(AppContext);

    const hasTransactions = () => {
        const externalTxs = JSON.parse(txsByExternalIndex);
        const internalTxs = JSON.parse(txsByInternalIndex);
        if ((Object.keys(externalTxs).length === 0 && externalTxs.constructor === Object) &&
            (Object.keys(internalTxs).length === 0 && internalTxs.constructor === Object)) {
            return false;
        }
        return true;
    }

    const fetchTransactions = async () => {
        const btc = unitConverter.convertToPreferredBTCDenominator(balance, preferredBitcoinUnit);
        setWalletBalance(btc);

        setLoading(true);
        const walletClass = await walletDiscovery.getWalletInstance({ id: id, type: type });


        if (type === walletType.WATCH_ONLY) {
            const derivationPathWatchOnly = walletClass.getDerivationPath();
            setDerivationPath(derivationPathWatchOnly);
        }
        else {
            const dPath = walletDiscovery.getPath(type);
            setDerivationPath(dPath);
        }

        const hasTxs = hasTransactions();

        if (!hasTxs) {
            await walletClass.fetchTransactions(id);
        }
        const txs = walletClass.getTransactions();
        setTransactions(txs);
        setLoading(false);
    }

    const refreshTransactions = async () => {
        setRefreshing(true);

        const walletClass = await walletDiscovery.getWalletInstance({ id: id, type: type });
        const walletBalance = await walletClass.fetchBalance(id);
        const btc = unitConverter.convertToPreferredBTCDenominator(walletBalance, preferredBitcoinUnit);
        setWalletBalance(btc);

        await walletClass.fetchTransactions(id);
        const txs = walletClass.getTransactions();
        setTransactions(txs);

        setRefreshing(false);
    }

    const getWalletInfo = () => {
        return {
            name: name,
            id: id,
            transactionCount: transactions.length,
            derivationPath: derivationPath,
            type: type,
            updateName: updateName
        }
    }

    const updateName = (name) => {
        setWalletName(name);
    }

    const onSend = () => {
        navigation.navigate(routes.SEND_TRANSACTION, route.params);
    }

    const onReceive = async () => {
        navigation.navigate(routes.RECEIVE_TRANSACTION, { walletId: id, type: type });
    }

    useEffect(() => {
        fetchTransactions();
    }, [])

    return (
        <Screen style={{ flex: 1 }}>
            <View style={styles.navigationPane}>
                <View style={styles.leftNav}>
                    <Icon name="chevron-left" color={Colors.white} size={20} onPress={() => { navigation.goBack() }} />
                </View>
                <View style={styles.options}>
                    <ActionButton
                        iconName='dots-horizontal'
                        onPress={() => navigation.navigate(routes.WALLET_SETTINGS, getWalletInfo())} />
                </View>
            </View>

            <View style={[styles.container]}>
                <AppText numberOfLines={1} style={styles.header}>{walletName}</AppText>
                <View style={styles.balanceContainer}>
                    <AppText style={styles.balance}>{walletBalance} {preferredBitcoinUnit?.title}</AppText>
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
                            onPress={() => navigation.navigate(routes.TRANSCATION_DETAIL, { tx: item, walletName: walletName })}
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

            <View style={styles.txButtons}>
                <TransactionButtons
                    isWatchOnly={type === walletType.WATCH_ONLY}
                    onSend={onSend}
                    onReceive={onReceive} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 110,
        margin: 20,
        paddingBottom: 10,
        borderColor: Colors.textGray,
        borderWidth: 0.3,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftNav: {
        paddingTop: 8,
    },
    navigationPane: {
        flexDirection: 'row',
        paddingLeft: 20,
    },
    options: {
        flexDirection: 'row-reverse',
        flex: 1,
        marginLeft: 20
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
        //fontWeight: 'bold',
        color: Colors.textGray,
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
    },
    txButtons: {
        position: 'absolute',
        width: '90%',
        bottom: 0,
        left: 20,
    }
});

export default WalletDetailScreen;