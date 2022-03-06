import React from 'react';
import { View, StyleSheet } from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import Localize from '../config/Localize';
import AppText from '../components/Text';

function ScanScreen({ navigation, route }) {
    const onSuccess = (e) => {
        route.params.onScanFinished(e.data);
        navigation.goBack();
    };
    return (
        <View style={styles.container}>
            <QRCodeScanner
                onRead={onSuccess}
                flashMode={RNCamera.Constants.FlashMode.auto}
                showMarker={true}
                topContent={
                    <AppText style={styles.centerText}>{Localize.getLabel('scanQRCodeTopContentMessage')}</AppText>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    centerText: {
        fontSize: 18,
        padding: 32,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10
    },
});

export default ScanScreen;