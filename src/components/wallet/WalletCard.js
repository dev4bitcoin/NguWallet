import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WatchOnly } from '../../class/wallets/watch-only';

import Colors from '../../config/Colors';
import Localize from '../../config/Localize';
import currency from '../../ngu_modules/currency';

function WalletCard({ onPress, wallet, shouldRefreshBalance }) {
    const [balance, setBalance] = useState(0);

    const getBalance = async () => {
        if (wallet) {
            const watchOnly = new WatchOnly();
            const walletBalance = await watchOnly.fetchBalance(id);
            console.log(walletBalance)
            const btc = currency.satoshiToBTC(walletBalance);
            setBalance(btc);
        }
    }
    useEffect(() => {
        console.log('refresh')
        if (shouldRefreshBalance)
            getBalance();
    }, [shouldRefreshBalance])

    const btc = currency.satoshiToBTC(wallet.balance);

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.detailsContainer}>
                    <Text style={styles.text}>{wallet.name}</Text>
                    <View style={styles.textType}>
                        <Text style={[styles.text, styles.bottomRowText]}>{wallet.type}</Text>
                    </View>
                </View>
                <View style={[styles.detailsContainer, styles.balanceContainer]}>
                    <Text style={[styles.text, styles.textAlign]}>
                        {shouldRefreshBalance ? Localize.getLabel('updating') : btc}
                    </Text>
                    <Text style={[styles.text, styles.textAlign, styles.bottomRowText]}>{Localize.getLabel('btc')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.watchOnly,
        height: 110,
        borderRadius: 5,
        flexDirection: 'row',
        marginTop: 10,
        borderColor: Colors.white,
        borderWidth: 0.3,
    },

    detailsContainer: {
        justifyContent: 'center',
        padding: 8
    },
    balanceContainer: {
        flex: 1,
        marginRight: 0
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
        padding: 8
    },
    textType: {
        //backgroundColor: Colors.gold,
        borderRadius: 5,
        //width: 110
    },
    textAlign: {
        textAlign: 'right'
    },
    bottomRowText: {
        color: Colors.bottomRowText,
        fontWeight: '600',
    }
});

export default WalletCard;