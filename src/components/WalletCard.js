import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../config/Colors';
import Localize from '../config/Localize';

function WalletCard({ onPress, name, type, balance }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.detailsContainer}>
                    <Text style={styles.text}>{name}</Text>
                    <View style={styles.textType}>
                        <Text style={[styles.text, styles.bottomRowText]}>{type}</Text>
                    </View>
                </View>
                <View style={[styles.detailsContainer, styles.balanceContainer]}>
                    <Text style={[styles.text, styles.textAlign]}>{balance}</Text>
                    <Text style={[styles.text, styles.textAlign, styles.bottomRowText]}>{Localize.getLabel('btc')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.medium,
        height: 110,
        borderRadius: 5,
        flexDirection: 'row',
        marginTop: 10
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
        fontWeight: 'bold',
        padding: 5
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
        color: Colors.black,
        fontWeight: '600',
    }
});

export default WalletCard;