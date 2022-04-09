import React, { useEffect, useState } from 'react';
import { Share, View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-community/clipboard';
import Icon from 'react-native-vector-icons/Ionicons';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import { WatchOnly } from '../class/wallets/watch-only';
import AppModal from '../components/Modal';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ReceiveTransaction({ route, navigation }) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState();

    const { walletId } = route.params;

    const getAddress = async () => {
        setLoading(true);
        const watchOnly = new WatchOnly();
        const freeAddress = await watchOnly.getAddressAsync(walletId);
        setAddress(freeAddress);
        await sleep(1000);
        setLoading(false);
    }

    useEffect(() => {
        getAddress();
    }, [])


    const copyTxId = async () => {
        ReactNativeHapticFeedback.trigger("impactLight", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
        });
        Clipboard.setString(address);
        setModalVisible(true);
        await sleep(1000);
        setModalVisible(false);
    }

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: address,
                url: '',
                title: Localize.getLabel('address')
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    return (
        <View style={styles.container}>
            {loading &&
                <ActivityIndicator size="large" />
            }
            <View style={styles.qrCode}>
                <QRCode
                    size={290}
                    color={Colors.white}
                    backgroundColor={Colors.black}
                    value="http://awesome.link.qr"
                />
            </View>
            <TouchableOpacity onPress={copyTxId}>
                <View style={styles.tx}>
                    <AppText style={styles.text}>{address}</AppText>
                    <Icon
                        name="copy-outline"
                        color={Colors.orange}
                        size={25}
                        style={styles.icon}
                    />
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onShare}>
                <View style={styles.share}>
                    <Icon
                        name="share-social"
                        color={Colors.orange}
                        size={28}
                        style={styles.shareIcon}
                    />
                    <AppText style={styles.shareText}>{Localize.getLabel('share')}</AppText>
                </View>
            </TouchableOpacity>
            <AppModal
                isModalVisible={isModalVisible}
                content={Localize.getLabel('copiedToClipboard')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.cardBackground,
        margin: 20,
        padding: 30,

    },
    qrCode: {
        paddingTop: 20
    },
    text: {
        fontSize: 19,
        paddingBottom: 10,
        color: Colors.white,
        width: '88%'
    },
    tx: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 30
    },
    icon: {
        paddingTop: 15
    },
    share: {
        flexDirection: 'row',
        borderColor: Colors.white,
        borderWidth: 0.5,
        backgroundColor: Colors.medium,
        borderRadius: 5,
        marginTop: 20,
        justifyContent: 'center',

    },
    shareIcon: {
        padding: 8,
        alignSelf: 'center'
    },
    shareText: {
        fontSize: 22,
        paddingTop: 8,
        fontWeight: 'bold',
        color: Colors.orange,
    }
});

export default ReceiveTransaction;