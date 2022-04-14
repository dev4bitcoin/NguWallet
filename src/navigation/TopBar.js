import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ActionButton from '../components/ActionButton';
import AppText from '../components/Text';

import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from './routes';

function TopBar({ }) {
    const navigation = useNavigation();

    const OnAlert = () => {
        Alert.alert(Localize.getLabel('warning'), Localize.getLabel('warningTestnetText'))
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <ActionButton
                    iconName='dots-horizontal'
                    onPress={() => navigation.navigate(routes.SETTINGS)} />
                {global.useTestnet &&
                    <AppText onPress={OnAlert} style={styles.text}>{Localize.getLabel('testnet')}</AppText>
                }
                <View style={styles.rightIcon}>
                    <ActionButton
                        iconName='plus'
                        color={Colors.white}
                        onPress={() => navigation.navigate(routes.ADD_WALLET)} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 20
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    text: {
        fontSize: 18,
        paddingTop: 5,
        color: Colors.white
    },
    rightIcon: {
        marginRight: 15
    }
});

export default TopBar;