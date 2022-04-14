import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

function AppActivityIndicator({ visible = false }) {
    if (!visible)
        return null;
    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" />
            {/* <AnimatedLottieView
                autoPlay
                backgroundColor='transparent'
                source={require("../assets/animations/bitcoinloader.json")} /> */}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        height: '100%',
        width: '100%',
        //backgroundColor: 'white',
        zIndex: 1,
        justifyContent: 'center',
        //flex: 1,
        opacity: 0.9,
    },
})
export default AppActivityIndicator;