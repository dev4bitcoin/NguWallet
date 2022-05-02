import React from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

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
        paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
        flex: 1
    },
    view: {
        //flex: 1
    }
})

export default Screen;