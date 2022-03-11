import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { formatDistanceToNowStrict, fromUnixTime } from 'date-fns'

import Colors from '../../config/Colors';
import currency from '../../ngu_modules/currency';
import AppText from '../Text';
import Localize from '../../config/Localize';

function TransactionListItem({ onPress, time, value }) {
    const isSent = Math.sign(value) === -1;
    const btc = currency.satoshiToBTC(value);
    const formattedTime = formatDistanceToNowStrict(fromUnixTime(time));
    return (
        <>
            <TouchableOpacity onPress={onPress}>
                <View style={styles.container}>
                    <View style={styles.iconHolder}>
                        <Icon
                            name={isSent ? "upload" : "download"}
                            size={20}
                            color={isSent ? Colors.priceRed : Colors.priceGreen}
                            style={styles.icon} />
                    </View>
                    <AppText style={styles.time}>{`${formattedTime} ${Localize.getLabel('ago')}`}</AppText>
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
        width: '55%',
        fontWeight: '600',
        paddingLeft: 20,
        color: Colors.gainsboro
    },
    balance: {
        width: '40%',
        textAlign: 'right',
        color: Colors.white,
        fontWeight: '600',
        textAlign: 'right'
    },
    priceUp: {
        color: Colors.gainsboro
    },
    priceDown: {
        color: Colors.priceRed
    },
    seperator: {
        borderWidth: 0.5,
        borderColor: Colors.medium,
        marginLeft: 20,
        marginRight: 20
        //height: 1
    }
});

export default TransactionListItem;