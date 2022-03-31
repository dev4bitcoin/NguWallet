import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import Colors from '../config/Colors';
import Localize from '../config/Localize';

function BalanceCard({ onPress, preferredCurrency, value }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Icon
                        name="bitcoin"
                        size={40}
                        color={Colors.orange}
                        style={styles.icon} />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.text}>{Localize.getLabel('bitcoin')}</Text>
                    <Text style={[styles.text, styles.bottomRowText]}>{Localize.getLabel('btc')}</Text>
                </View>
                <View style={[styles.detailsContainer, styles.balanceContainer]}>
                    <Text style={[styles.text, styles.textAlign]}>{preferredCurrency.symbol}{value}</Text>
                    <Text style={[styles.text, styles.textAlign, styles.bottomRowText]}>{preferredCurrency.endPointKey}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.cardBackground,
        height: 110,
        borderRadius: 5,
        flexDirection: 'row',
        margin: 20,
        marginTop: 30,
        borderColor: Colors.white,
        borderWidth: 0.2,
    },
    screen: {
        padding: 20,
    },
    imageContainer: {
        marginTop: 35,
        marginLeft: 10
    },
    icon: {
        paddingLeft: 10,
        paddingRight: 10
    },
    detailsContainer: {
        justifyContent: 'center',
        padding: 10
    },
    balanceContainer: {
        flex: 1,
        //marginRight: 10
    },
    text: {
        color: '#fff',
        fontSize: 20,
        padding: 5
    },
    textAlign: {
        textAlign: 'right'
    },
    bottomRowText: {
        color: '#6d767f'
    }
});

export default BalanceCard;