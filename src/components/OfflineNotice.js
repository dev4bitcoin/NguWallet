import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import AppText from './Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';

function OfflineNotice(props) {
    const netInfo = useNetInfo();
    if (netInfo.type !== "unknown" && netInfo.isInternetReachable === false) {

        return (
            <View style={styles.container}>
                <AppText style={styles.text}>{Localize.getLabel('noConnection')}</AppText>
            </View>
        );
    }
    return null;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.priceRed,
        height: 50,
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        top: getStatusBarHeight(),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },
    text: {
        color: Colors.white,
        fontWeight: 'bold'
    }
});

export default OfflineNotice;