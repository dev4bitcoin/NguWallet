import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';

function Screen({ children, style }) {
    return (
        <SafeAreaView style={[styles.screen]}>
            <View style={[style]}>{children}</View>
            {/* {children} */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        paddingTop: Constants.statusBarHeight,
        flex: 1
    },
    view: {
        //flex: 1
    }
})

export default Screen;