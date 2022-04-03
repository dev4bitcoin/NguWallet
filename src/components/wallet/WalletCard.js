import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WatchOnly } from '../../class/wallets/watch-only';

import Colors from '../../config/Colors';
import Localize from '../../config/Localize';
import unitConverter from '../../helpers/unitConverter';
import { AppContext } from '../../ngu_modules/appContext';

function WalletCard({ onPress, wallet, shouldRefreshBalance }) {
    const [balance, setBalance] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const { preferredBitcoinUnit } = useContext(AppContext);

    const getBalance = async (shouldRefreshBalance) => {
        if (!shouldRefreshBalance) {
            return;
        }
        if (wallet) {
            setIsFetching(true);
            const watchOnly = new WatchOnly();
            const walletBalance = await watchOnly.fetchBalance(wallet.id);
            console.log(walletBalance)
            const btc = unitConverter.convertToPreferredBTCDenominator(walletBalance, preferredBitcoinUnit);
            setBalance(btc);
            setIsFetching(false);
        }
    }
    useEffect(() => {
        getBalance(shouldRefreshBalance);
    }, [shouldRefreshBalance])

    const btc = unitConverter.convertToPreferredBTCDenominator(wallet.balance, preferredBitcoinUnit);

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.detailsContainer}>
                    <Text numberOfLines={1} style={styles.text}>{wallet.name}</Text>
                    <View style={styles.textType}>
                        <Text style={[styles.text, styles.bottomRowText]}>{wallet.type}</Text>
                    </View>
                </View>
                <View style={[styles.detailsContainer, styles.balanceContainer]}>
                    <Text style={[styles.text, styles.textAlign]}>
                        {isFetching ? Localize.getLabel('updating') : btc}
                    </Text>
                    <Text style={[styles.text, styles.textAlign, styles.bottomRowText]}>{preferredBitcoinUnit?.title}</Text>
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
        padding: 8,
        width: 154
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