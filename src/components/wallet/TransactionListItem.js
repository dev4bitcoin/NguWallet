import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { formatDistanceToNowStrict, fromUnixTime } from 'date-fns'

import Colors from '../../config/Colors';
import AppText from '../Text';
import Localize from '../../config/Localize';
import unitConverter from '../../helpers/unitConverter';
import { AppContext } from '../../ngu_modules/appContext';

function TransactionListItem({ onPress, time, value }) {
    const { preferredBitcoinUnit } = useContext(AppContext);

    const isSent = Math.sign(value) === -1;
    const btc = unitConverter.convertToPreferredBTCDenominator(value, preferredBitcoinUnit);
    const formattedTime = time ? formatDistanceToNowStrict(fromUnixTime(time)) : '';
    return (
        <>
            <TouchableOpacity onPress={onPress}>
                <View style={styles.container}>
                    <View style={styles.iconHolder}>
                        <Icon
                            name={isSent ? "upload" : "download"}
                            size={20}
                            color={isSent ? Colors.priceRed : Colors.white}
                            style={styles.icon} />
                    </View>
                    <AppText style={[styles.time, { color: time ? Colors.gainsboro : Colors.priceRed }]}>{time ? `${formattedTime} ${Localize.getLabel('ago')}` : Localize.getLabel('pendingConfirmation')}</AppText>
                    <AppText style={[styles.balance, isSent ? styles.priceDown : styles.priceUp]}>{btc}</AppText>

                </View>
            </TouchableOpacity>
            <View style={styles.seperator} />
        </>

    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 20,
        width: '100%'
    },
    iconHolder: {
        //backgroundColor: Colors.medium,
    },
    icon: {

    },
    time: {
        width: '58%',
        fontWeight: '600',
        paddingLeft: 20,
        color: Colors.gainsboro
    },
    balance: {
        width: '37%',
        textAlign: 'right',
        color: Colors.white,
        textAlign: 'right'
    },
    priceUp: {
        color: Colors.white
    },
    priceDown: {
        color: Colors.priceRed
    },
    seperator: {
        borderWidth: 0.5,
        borderColor: Colors.medium,
        marginLeft: 20,
        marginRight: 20
    }
});

export default TransactionListItem;