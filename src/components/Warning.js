import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../config/Colors';
import AppText from './Text';

function Warning({ header, text }) {
    return (
        <View style={styles.container}>
            <AppText style={styles.header}>{header}</AppText>
            <AppText>{text}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 140,
        marginLeft: 20,
        marginRight: 20,
        padding: 10,
        borderRadius: 5,
        backgroundColor: Colors.white
    },
    header: {
        fontSize: 20,
        paddingBottom: 10,
        fontWeight: 'bold',
        color: Colors.black
    },
    text: {

    }
});

export default Warning;