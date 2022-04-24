import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import PushNotificationIOS from "@react-native-community/push-notification-ios";

import ActionButton from './ActionButton';
import AppAlert from './AppAlert';
import AppText from './Text';

import Colors from '../config/Colors';
import Localize from '../config/Localize';
import routes from '../navigation/routes';

function TopBar({ }) {
    const [showAlert, setShowAlert] = useState(false);

    const navigation = useNavigation();

    const OnAlert = () => {
        //setShowAlert(true);
        sendLocalNotification();
    }

    const sendLocalNotification = () => {
        PushNotificationIOS.addNotificationRequest({
            id: 'sdsd',
            title: 'Recieved Transaction',
            subtitle: 'subtitle',
            body: 'Recieved 0.01 BTC',
            badge: 1,

            userInfo: { walletId: '3e19a1c2ab96d4782de7ce263df2fc3c487ef3125b5642e09d9622c3ac4a4439' }

        });
    };

    return (
        <View style={styles.container}>
            <AppAlert
                visible={showAlert}
                isAlert={true}
                title={Localize.getLabel('warning')}
                message={Localize.getLabel('warningTestnetText')}
                onCancel={() => setShowAlert(false)}
            />
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