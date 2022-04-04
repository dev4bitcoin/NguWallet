import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../config/Colors';
import AppText from './Text';

function Warning({ title, content }) {
    return (
        <View style={styles.container}>
            <AppText style={styles.header}>{title}</AppText>
            <AppText>{content}</AppText>
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