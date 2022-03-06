import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import AppButton from '../components/Button';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';

function AddWallet({ navigation }) {
    return (
        <View style={styles.container}>
            <View>
                <AppText style={styles.header}>{Localize.getLabel('addWalletHeader')}</AppText>
                <AppText style={styles.header1}>{Localize.getLabel('addWalletHeader1')}</AppText>
                <AppText style={styles.subHeader}>{Localize.getLabel('addWalletSubHeader')}</AppText>
            </View>
            <View style={styles.iconHolder}>
                <Image style={styles.icon} source={require('../assets/bitcoinwallet.png')} />
            </View>
            <View style={styles.buttons}>
                <AppButton
                    onPress={() => navigation.navigate(routes.IMPORT_WALLET)}
                    title="Watch-only"
                    name="eye-outline"
                    color={Colors.gold} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    header: {
        fontSize: 34,
        fontWeight: 'bold',
        paddingRight: 20,
        paddingLeft: 10,
        paddingTop: 20,
        color: Colors.white,
    },
    header1: {
        fontSize: 33,
        fontWeight: 'bold',
        paddingRight: 20,
        paddingLeft: 10,
        color: Colors.white,
    },
    subHeader: {
        paddingTop: 20,
        color: Colors.white,
        paddingLeft: 10,
    },
    iconHolder: {
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20
    },
    icon: {
        width: 250,
        height: 250,
    },
    buttons: {
        marginLeft: 10,
        marginRight: 10
    }
});

export default AddWallet;