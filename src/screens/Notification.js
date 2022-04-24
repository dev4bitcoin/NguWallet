import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { useNavigation } from '@react-navigation/native';

import appStorage from '../class/app-storage';
import routes from '../navigation/routes';

function Notification(props) {
    const navigation = useNavigation();

    const navigateToWalletDetail = async (walletId) => {
        if (walletId) {
            const wallet = await appStorage.getWalletById(walletId);

            if (wallet) {
                navigation.navigate(routes.WALLET_DETAIL,
                    {
                        id: wallet.id,
                        type: wallet.type,
                        name: wallet.name,
                        balance: wallet.name
                    });
            }
        }
    }

    const onRemoteNotification = async (notification) => {
        const isClicked = notification.getData().userInteraction === 1;
        console.log('user clicked' + notification);
        if (isClicked) {
            console.log('user clicked');

            // Navigate user to another screen
            const walletId = notification.getData().walletId;
            navigateToWalletDetail(walletId);
        } else {
            console.log('user not clicked')
            // Do something else with push notification
        }
    };

    const configureNotification = () => {
        PushNotificationIOS.getInitialNotification().then((notification) => {
            if (notification) {
                console.log('App launched by push');

                // Navigate user to another screen
                const walletId = notification.getData().walletId;
                navigateToWalletDetail(walletId);
            }
        });

        const type = 'localNotification';
        PushNotificationIOS.addEventListener(type, onRemoteNotification);
        return () => {
            PushNotificationIOS.removeEventListener(type);
        };
    }
    useEffect(() => {
        configureNotification();
    }, [])

    return (
        <View style={styles.container}></View>
    );
}

const styles = StyleSheet.create({
    container: {}
});

export default Notification;