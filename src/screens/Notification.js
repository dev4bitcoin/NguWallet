import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import appStorage from '../class/app-storage';
import routes from '../navigation/routes';
import NotificationService from '../../NotificationService';

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
        const isClicked = notification?.data?.userInteraction === 1;
        if (isClicked) {
            console.log('user clicked');

            // Navigate user to another screen
            const walletId = notification?.data?.walletId;
            console.log(walletId);
            if (walletId) {
                navigateToWalletDetail(walletId);
            }
        } else {
            console.log('user not clicked')
            // Do something else with push notification
        }
    };

    const onRegister = async (tokenData) => {
        if (tokenData) {
            console.log('token:' + tokenData.token);
            await appStorage.storeDeviceToken(tokenData.token);

        } else {
            console.log('token is empty')
            // Do something else with push notification
        }
    };

    const configureNotification = () => {
        const notify = new NotificationService(
            onRegister, onRemoteNotification
        );
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