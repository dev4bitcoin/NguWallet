import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

function AppActivityIndicator({ visible = false }) {
    if (!visible)
        return null;
    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" />
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
})
export default AppActivityIndicator;