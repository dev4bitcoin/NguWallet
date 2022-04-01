import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

import AppButton from '../components/Button';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';
import { WatchOnly } from '../class/wallets/watch-only';
import ActivityIndicator from '../components/ActivityIndicator';

function ImportWallet({ navigation, route }) {
    const [walletKey, setWalletKey] = useState();
    const [loading, setLoading] = useState(false);
    const onScanFinished = (key) => {
        setWalletKey(key);
    }

    const onImport = async () => {
        try {
            const watchOnly = new WatchOnly();

            const key = "tpubDBx1an3fsrQqJfttU44VXsn59eySYtfnTz6Qr2Nitewet21Zb915kfjZffUxEK9ZT3SJmqFbNCKuRtdP6n3H3ADe9rxg9Uyk6NRXGA9pe8o"
            if (global.useTestnet && !key.startsWith('tpub')) {
                Alert.alert(Localize.getLabel('invalidPubKey'));
                return;
            }

            setWalletKey(key);
            if (!watchOnly.isValid(walletKey)) {
                Alert.alert(Localize.getLabel('invalidPubKey'));
                return;
            }
            setLoading(true);
            await watchOnly.init();
            //console.log('Reset Wallet')
            //await watchOnly.resetWallets();
            console.log('Import Wallet')
            await watchOnly.saveWalletToDisk();

            navigation.navigate(routes.HOME);
            setLoading(false);
        }
        catch (ex) {
            console.log(ex);
            Alert.alert('Invalid address', ex)
            setLoading(false);
        }
    }

    return (
        <>
            <ActivityIndicator visible={loading} />

            <View style={styles.container}>
                <AppText style={styles.header}>{Localize.getLabel('importScreenHeaderText')}</AppText>
                <TextInput
                    multiline
                    style={styles.input}
                    editable
                    value={walletKey} />
                <TouchableOpacity
                    onPress={() => navigation.navigate(routes.SCAN, { onScanFinished })}
                    style={styles.scanButton}>
                    <AppText
                        style={styles.scan}>
                        {Localize.getLabel('scan')}
                    </AppText>
                </TouchableOpacity>
                <View style={styles.importButton}>
                    <AppButton
                        onPress={onImport}
                        title="Import"
                        name="import"
                        color={Colors.orange} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 30,
    },
    header: {
        color: Colors.white,
        textAlign: 'center',
        paddingBottom: 30,
    },
    input: {
        height: 150,
        marginTop: 20,
        borderWidth: 1,
        margin: 20,
        borderColor: Colors.white,
        color: Colors.white
    },
    buttons: {
        marginTop: 50
    },
    scanButton: {
        marginTop: 20,
        paddingLeft: 20,
        width: '40%',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    importButton: {
        marginTop: 60,
        width: 200,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    scan: {
        color: Colors.white,
        textAlign: 'center',
        textDecorationLine: 'underline',
        textDecorationColor: Colors.white,
        fontWeight: 'bold',
    }
});

export default ImportWallet;