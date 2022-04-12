import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../components/Text';

import Colors from '../config/Colors';
import Localize from '../config/Localize';
import ActionButton from './ActionButton';
import routes from './routes';

function TopBar({ }) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <ActionButton
                    iconName='dots-horizontal'
                    onPress={() => navigation.navigate(routes.SETTINGS)} />
                {global.useTestnet &&
                    <AppText style={styles.text}>{Localize.getLabel('testnet')}</AppText>
                }
                <View style={styles.rightIcon}>
                    <ActionButton
                        iconName='plus'
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
        marginRight: 20
    }
});

export default TopBar;