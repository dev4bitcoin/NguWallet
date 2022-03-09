import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import FoundationIcon from 'react-native-vector-icons/Foundation';

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
                <FoundationIcon
                    name="bitcoin-circle"
                    size={50}
                    color={Colors.orange}
                    style={styles.foundationIcon} />
                <Icon
                    name="wallet"
                    size={100}
                    color={Colors.orange}
                    style={styles.icon} />
            </View>
            <View style={styles.buttons}>
                <AppButton
                    onPress={() => navigation.navigate(routes.IMPORT_WALLET)}
                    title="Watch-only"
                    name="eye-outline"
                    color={Colors.orange} />
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
        marginTop: 40,
        marginBottom: 30
    },
    icon: {
        marginTop: -30
    },
    foundationIcon: {
        paddingBottom: 0,
        marginLeft: 30
    },
    buttons: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 30
    }
});

export default AddWallet;