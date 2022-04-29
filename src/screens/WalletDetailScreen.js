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
import AppActivityIndicator from '../components/AppActivityIndicator';
import appStorage from '../class/app-storage';

function WalletDetailScreen({ route, navigation }) {
    const { id, name, balance, type } = route.params;
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState();
    const [loading, setLoading] = useState(false);
    const [loadingBarVisible, setLoadingBarVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [derivationPath, setDerivationPath] = useState();
    const [walletName, setWalletName] = useState(name);
    const { preferredBitcoinUnit } = useContext(AppContext);
    const [loadingMessage, setLoadingMessage] = useState();

    const setPath = (walletClass) => {
        if (type === walletType.WATCH_ONLY) {
            const derivationPathWatchOnly = walletClass.getDerivationPath();
            setDerivationPath(derivationPathWatchOnly);
        }
        else {
            const dPath = walletDiscovery.getPath(type);
            setDerivationPath(dPath);
        }
    }

    const fetchTransactions = async () => {
        const walletClass = await walletDiscovery.getWalletInstance({ id: id, type: type });
        const walletBalance = await walletClass.fetchBalance(id);
        const btc = unitConverter.convertToPreferredBTCDenominator(walletBalance, preferredBitcoinUnit);
        setWalletBalance(btc);
        setPath(walletClass);
        await walletClass.fetchTransactions(id);
        const txs = walletClass.getTransactions();
        setTransactions(txs);
    }

    const refreshTransactions = async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    }

    const getWalletInfo = () => {
        return {
            name: name,
            id: id,
            transactionCount: transactions?.length,
            derivationPath: derivationPath,
            type: type,
            updateName: updateName
        }
    }

    const updateName = (name) => {
        setWalletName(name);
    }

    const onSend = () => {
        const amountInSats = unitConverter.convertToSatoshi(parseFloat(walletBalance), preferredBitcoinUnit);
        navigation.navigate(routes.SEND_TRANSACTION, { id: id, type: type, balance: amountInSats });
    }

    const getAddress = async () => {
        setLoadingBarVisible(true);
        setLoadingMessage(Localize.getLabel('fetchingAddressMessage'));
        const walletClass = await walletDiscovery.getWalletInstance({ id: id, type: type });
        const freeAddress = await walletClass.getAddressAsync(id);
        setLoadingBarVisible(false);
        return freeAddress;
    }

    const onReceive = async () => {
        const address = await getAddress();
        const token = await appStorage.getDeviceToken();
        navigation.navigate(routes.RECEIVE_TRANSACTION, { walletId: id, type: type, address: address, token: token });
    }

    const loadData = async () => {
        const btc = unitConverter.convertToPreferredBTCDenominator(balance, preferredBitcoinUnit);
        setWalletBalance(btc);
        setLoading(true);
        await fetchTransactions();
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [])

    return (
        <>
            <AppActivityIndicator
                message={loadingMessage}
                visible={loadingBarVisible} />
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
                        <AppText style={styles.balance}>{walletBalance ? walletBalance : 0} {preferredBitcoinUnit?.title}</AppText>
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
                                tx={item}
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
        </>
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