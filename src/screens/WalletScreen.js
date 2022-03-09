import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';
import { AppStorage } from '../class/app-storage';
import WalletCard from '../components/WalletCard';

const appStorage = new AppStorage();

const list = [
    {
        name: 'Imported Watch only wallet',
        balance: 450000,
        type: 'WatchOnly',
        id: 1
    },
    {
        name: 'Ghost Wallet',
        balance: 2000,
        type: 'WatchOnly',
        id: 2
    },
    {
        name: 'Imported Watch only wallet',
        balance: 35000,
        type: 'WatchOnly',
        id: 3
    },
    {
        name: 'Savings',
        balance: 60000000,
        type: 'WatchOnly',
        id: 4
    },
    {
        name: 'For Jack',
        balance: 21000,
        type: 'WatchOnly',
        id: 5
    },
    {
        name: 'Imported Watch only wallet',
        balance: 0,
        type: 'WatchOnly',
        id: 6
    }
]

function WalletScreen({ }) {
    const [wallets, setWallets] = useState([]);

    useEffect(() => {
        const getWallets = async () => {
            const wallets = await appStorage.getWallets();
            setWallets(wallets || []);
        }
        getWallets();
    }, [wallets])

    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.headerArea}>
                <View>
                    <AppText style={styles.header}>{Localize.getLabel('wallets')}</AppText>
                </View>
                <View style={styles.icon}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.ADD_WALLET)}>
                        <Icon
                            name="plus-circle"
                            size={30}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {wallets && wallets.length > 0 &&
                <FlatList
                    style={styles.list}
                    data={wallets}
                    //showsVerticalScrollIndicator={false}
                    keyExtractor={wallet => wallet.id.toString()}
                    renderItem={({ item }) => (
                        <WalletCard
                            name={item.name}
                            type={item.type}
                            balance={item.balance}
                            onPress={() => navigation.navigate(routes.WALLET_DETAIL, item)}
                        />
                    )}
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
    },
    headerArea: {
        flexDirection: 'row',
    },
    header: {
        fontSize: 26,
        paddingRight: 20,
        fontWeight: 'bold',
        color: '#fff',
        paddingLeft: 5
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
        marginTop: 20
    }
});

export default WalletScreen;