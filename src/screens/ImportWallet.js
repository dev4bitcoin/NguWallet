import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

import AppButton from '../components/Button';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';
import { WatchOnly } from '../class/wallets/watch-only';
import walletType from '../class/wallets/walletType';
import AppActivityIndicator from '../components/AppActivityIndicator';
import AppAlert from '../components/AppAlert';

function ImportWallet({ navigation, route }) {
    const [showAlert, setShowAlert] = useState(false);
    const [walletKey, setWalletKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageDescription, setMessageDescription] = useState('');
    const [loadingMessage, setLoadingMessage] = useState();

    const onScanFinished = (key) => {
        setWalletKey(key);
    }

    useEffect(() => {
        if (global.useTestnet) {
            setShowAlert(true);
            setMessageDescription(Localize.getLabel('testnetWalletSupportMessage'));
        }
    }, [])

    const onImport = async () => {
        try {
            const watchOnly = new WatchOnly();
            //await watchOnly.resetWallets();
            //const key = "tpubDAenfwNu5GyCJWv8oqRAckdKMSUoZjgVF5p8WvQwHQeXjDhAHmGrPa4a4y2Fn7HF2nfCLefJanHV3ny1UY25MRVogizB2zRUdAo7Tr9XAjm";
            //setWalletKey(key);
            if (global.useTestnet && !walletKey.startsWith('tpub')) {
                setShowAlert(true);
                setMessageDescription(Localize.getLabel('invalidPublicKey'));
                return;
            }

            if (!watchOnly.isValid(walletKey)) {
                setShowAlert(true);
                setMessageDescription(Localize.getLabel('invalidPubKey'));
                return;
            }
            const isExist = await watchOnly.isWalletExist(walletKey);
            if (isExist) {
                setShowAlert(true);
                setMessageDescription(Localize.getLabel('walletExistMessage'));
                return;
            }

            setLoading(true);
            setLoadingMessage(Localize.getLabel('importWalletMessage'));

            console.log('Import Wallet');

            await watchOnly.setSecret(walletKey);
            setLoadingMessage(Localize.getLabel('savingToDiskMessage'));

            await watchOnly.saveWalletToDisk(walletType.WATCH_ONLY, Localize.getLabel('watchOnly'), walletKey);

            navigation.navigate(routes.HOME);
            setLoading(false);
        }
        catch (ex) {
            console.log(ex);
            setShowAlert(true);
            setMessageDescription('Invalid address: ' + ex.message);
            setLoading(false);
        }
    }

    return (
        <>
            <AppActivityIndicator
                message={loadingMessage}
                visible={loading} />
            <AppAlert
                visible={showAlert}
                isAlert={true}
                title={Localize.getLabel('warning')}
                message={messageDescription}
                onCancel={() => setShowAlert(false)}
            />
            <View style={styles.container}>
                <AppText style={styles.header}>{global.useTestnet ? Localize.getLabel('importScreenHeaderTextTestnet') : Localize.getLabel('importScreenHeaderText')}</AppText>
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
                        title={Localize.getLabel('import')}
                        name="import"
                        bgColor={Colors.cardBackground}
                        color={Colors.white} />
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
        marginLeft: 20,
        marginRight: 20,
        justifyContent: 'center',
        //alignSelf: 'center'
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