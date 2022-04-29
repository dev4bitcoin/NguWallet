import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../config/Colors';
import AppText from './Text';

function AppActivityIndicator({ visible = false, message }) {
    if (!visible)
        return null;
    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color={Colors.white} />
            {message &&
                <AppText style={styles.text}>{message}</AppText>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        height: '100%',
        width: '100%',
        zIndex: 1,
        justifyContent: 'center',
        opacity: 0.9,
    },
    text: {
        color: Colors.white,
        textAlign: 'center',
        paddingTop: 5
    }
})
export default AppActivityIndicator;