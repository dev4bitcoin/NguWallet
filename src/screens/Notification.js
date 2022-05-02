import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Notifications } from 'react-native-notifications';

import appStorage from '../class/app-storage';
import routes from '../navigation/routes';
//import NotificationService from '../../NotificationService';

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
                        balance: wallet.balance
                    });
            }
        }
    }

    const onRemoteNotification = async (notification) => {
        if (!notification) {
            return;
        }
        // Navigate user to another screen
        const walletId = notification?.walletId;
        console.log(walletId);
        if (walletId) {
            navigateToWalletDetail(walletId);
        }

    };

    const onRegister = async (token) => {
        if (token) {
            await appStorage.storeDeviceToken(token);

        } else {
            console.log('token is empty')
            // Do something else with push notification
        }
    };

    const configureNotification = async () => {
        // Request permissions on iOS, refresh token on Android
        Notifications.registerRemoteNotifications();

        Notifications.events().registerRemoteNotificationsRegistered((event) => {
            // TODO: Send the token to my server so it could send back push notifications...
            console.log("Device Token Received", event.deviceToken);
            onRegister(event.deviceToken);
        });

        Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
            console.error(event);
        });

        Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
            console.log("Notification Received - Foreground", notification.payload);
            console.log('---------------')
            // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
            completion({ alert: true, sound: true, badge: true });
        });

        Notifications.events().registerNotificationOpened((notification, completion, action) => {
            console.log("Notification opened by device user", notification.payload);
            onRemoteNotification(notification.payload);
            completion();
        });

        Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
            console.log("Notification Received - Background", notification.payload);

            // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
            //completion({ alert: true });
        });

        Notifications.getInitialNotification()
            .then((notification) => {
                console.log("Initial notification was:", (notification ? notification.payload : 'N/A'));

            })
            .catch((err) => console.error("getInitialNotifiation() failed", err));

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