import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';
import WalletCard from '../components/wallet/WalletCard';
import appStorage from '../class/app-storage';
import { AppContext } from '../ngu_modules/appContext';
import WalletDeleteAction from '../components/WalletDeleteAction';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function WalletScreen({ }) {
    const { setTotalWalletBalance } = useContext(AppContext);

    const [wallets, setWallets] = useState([]);
    const [shouldRefreshBalance, setShouldRefreshBalance] = useState(false);

    const getWallets = async () => {
        const wallets = await appStorage.getWallets();
        let balance = 0;
        if (wallets.length > 0) {
            wallets.forEach(wallet => {
                balance += wallet.balance;
            });
        }
        setTotalWalletBalance(balance);
        setWallets(wallets || []);
    }

    useEffect(() => {
        getWallets();
    }, [wallets])

    const refreshWalletBalance = async () => {
        setShouldRefreshBalance(true);
        //getWallets();
        await sleep(2000);
        setShouldRefreshBalance(false);
    }

    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <AppText style={styles.header}>{Localize.getLabel('wallets')}</AppText>

            {wallets && wallets.length > 0 &&
                <FlatList
                    style={styles.list}
                    data={wallets}
                    keyExtractor={wallet => wallet.id.toString()}
                    extraData={shouldRefreshBalance}
                    renderItem={({ item }) => (
                        <WalletCard
                            wallet={item}
                            shouldRefreshBalance={shouldRefreshBalance}
                            setShouldRefreshBalance={setShouldRefreshBalance}
                            onPress={() => navigation.navigate(routes.WALLET_DETAIL, item)}
                        />
                    )}
                    refreshControl={<RefreshControl
                        colors={["#fff"]}
                        tintColor={Colors.white}
                        size="default"
                        enabled={true}
                        progressBackgroundColor={Colors.cardBackground}
                        refreshing={shouldRefreshBalance}
                        onRefresh={refreshWalletBalance} />}
                />
            }
            {wallets && wallets.length == 0 &&
                <View style={styles.noWallet}>
                    <AppText style={styles.noWalletText}>{Localize.getLabel('noWalletText')}</AppText>
                </View>
            }

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: Colors.appBackground
    },
    headerArea: {
        flexDirection: 'row',
    },
    header: {
        fontSize: 26,
        paddingRight: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    icon: {
        flex: 1,
        flexDirection: 'row-reverse',
        paddingLeft: 5
    },
    noWallet: {
        paddingTop: 100,
        justifyContent: 'center',
    },
    noWalletText: {
        color: Colors.textGray,
        textAlign: 'center'
    },
    list: {
        marginTop: 5
    }
});

export default WalletScreen;