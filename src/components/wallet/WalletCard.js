import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import walletType from '../../class/wallets/walletType';

import Colors from '../../config/Colors';
import Localize from '../../config/Localize';
import unitConverter from '../../helpers/unitConverter';
import walletDiscovery from '../../helpers/walletDiscovery';
import { AppContext } from '../../ngu_modules/appContext';

function WalletCard({ onPress, wallet, shouldRefreshBalance, renderRightActions }) {
    const [balance, setBalance] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const { preferredBitcoinUnit } = useContext(AppContext);

    const getBalance = async (shouldRefreshBalance) => {
        if (!shouldRefreshBalance) {
            return;
        }
        if (wallet) {
            setIsFetching(true);
            const walletClass = await walletDiscovery.getWalletInstance(wallet);
            const walletBalance = await walletClass.fetchBalance(wallet.id);
            console.log(walletBalance)
            const btc = unitConverter.convertToPreferredBTCDenominator(walletBalance, preferredBitcoinUnit);
            setBalance(btc);
            setIsFetching(false);
        }
    }

    useEffect(() => {
        getBalance(shouldRefreshBalance);
    }, [shouldRefreshBalance])

    const onSwipeOpen = () => {
        ReactNativeHapticFeedback.trigger("impactLight", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
        });
    }


    function getColorCodeByWalletType() {
        const type = wallet.type;
        let colorCode;

        if (type === walletType.WATCH_ONLY) {
            colorCode = Colors.walletTypeDefaultColor;
        }
        else if (type === walletType.LIGHTNING) {
            colorCode = Colors.blue;
        }
        else {
            colorCode = Colors.gold;
        }

        return colorCode;
    }

    function getLabelForWalletType(type) {
        let label = '';

        if (type === walletType.WATCH_ONLY) {
            label = type;
        }
        else if (type === walletType.HD_SEGWIT_Bech32) {
            label = Localize.getLabel('segwit')
        }
        else if (type === walletType.HD_SEGWIT_P2SH) {
            label = Localize.getLabel('legacy')
        }

        return label;
    }

    const btc = unitConverter.convertToPreferredBTCDenominator(wallet.balance, preferredBitcoinUnit);

    return (
        <Swipeable
            overshootFriction={3}
            onSwipeableOpen={onSwipeOpen}
            renderRightActions={renderRightActions}>
            <TouchableOpacity onPress={onPress}>
                <View style={[styles.container]}>
                    <View style={styles.detailsContainer}>
                        <Text numberOfLines={1} style={styles.text}>{wallet.name}</Text>
                        <View style={[styles.textType, { backgroundColor: getColorCodeByWalletType() }]}>
                            <Text style={[styles.walletTypeText]}>{getLabelForWalletType(wallet.type)}</Text>
                        </View>
                    </View>

                    <View style={[styles.balanceContainer]}>
                        <Text numberOfLines={1} style={[styles.price, styles.textAlign]}>
                            {isFetching ? Localize.getLabel('updating') : btc}
                        </Text>
                        <Text style={[styles.walletTypeText, styles.textAlign, styles.bottomRowText]}>{preferredBitcoinUnit?.title}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 100,
        flexDirection: 'row',
        marginTop: 0,
        marginBottom: 1,
        borderColor: Colors.textGray,
        borderWidth: 0.3,
        borderRightColor: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0
    },

    detailsContainer: {
        justifyContent: 'center',
        width: '60%'
    },
    balanceContainer: {
        flex: 1,
        marginRight: 0,
        justifyContent: 'center',
        padding: 2,

    },
    walletTypeText: {
        color: Colors.walletTypeBGColor,
        fontSize: 16,
        fontWeight: '500',
    },
    text: {
        color: Colors.white,
        fontSize: 19,
        fontWeight: '500',
        paddingTop: 8,
        paddingBottom: 16,
    },
    price: {
        color: Colors.white,
        fontSize: 19,
        fontWeight: '500',
        paddingTop: 8,
        paddingBottom: 16,
    },
    textType: {
        borderRadius: 3,
        alignSelf: 'flex-start',
        padding: 1,
        paddingRight: 4,
        paddingLeft: 4
    },
    textAlign: {
        textAlign: 'right'
    },
    bottomRowText: {
        color: Colors.walletTypeDefaultColor
    }
});

export default WalletCard;