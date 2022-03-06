import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';

function WalletScreen({ }) {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.headerArea}>
                <View>
                    <AppText style={styles.header}>{Localize.getLabel('wallets')}</AppText>
                </View>
                <View style={styles.icon}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.ADD_WALLET)}>
                        <Icon
                            name="plus-circle"
                            size={30}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.noWallet}>
                <AppText style={styles.noWalletText}>{Localize.getLabel('noWalletText')}</AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
    headerArea: {
        flexDirection: 'row',
    },
    header: {
        fontSize: 26,
        paddingRight: 20,
        fontWeight: 'bold',
        color: '#fff',
        paddingLeft: 5
    },
    icon: {
        flex: 1,
        flexDirection: 'row-reverse',
        paddingLeft: 5
    },
    noWallet: {

        paddingTop: 100,
        justifyContent: 'center',
    },
    noWalletText: {
        color: Colors.textGray,
        textAlign: 'center'
    }
});

export default WalletScreen;