import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import AppButton from '../components/Button';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';

function ImportWallet({ navigation, route }) {
    const [walletKey, setWalletKey] = useState();
    const onScanFinished = (key) => {
        setWalletKey(key);
    }

    return (
        <View style={styles.container}>
            <AppText style={styles.header}>{Localize.getLabel('importScreenHeaderText')}</AppText>
            <TextInput
                multiline
                style={styles.input}
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
                    //onPress={() => navigation.navigate(routes.IMPORT_WALLET)}
                    title="Import"
                    name="import"
                    color={Colors.gold} />
            </View>
        </View>
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