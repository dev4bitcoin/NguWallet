import React, { useEffect, useState } from 'react';
import { Share, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-community/clipboard';
import Icon from 'react-native-vector-icons/Ionicons';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import AppModal from '../components/Modal';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import walletDiscovery from '../helpers/walletDiscovery';
import AppActivityIndicator from '../components/AppActivityIndicator';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ReceiveTransaction({ route, navigation }) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState();

    const { walletId, type } = route.params;

    const getAddress = async () => {
        setLoading(true);
        const walletClass = await walletDiscovery.getWalletInstance({ id: walletId, type: type });
        const freeAddress = await walletClass.getAddressAsync(walletId);
        setAddress(freeAddress);
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
        <>
            <AppActivityIndicator visible={loading} />
            <View style={styles.container}>
                <View style={styles.qrCode}>
                    <QRCode
                        size={335}
                        color={Colors.white}
                        backgroundColor={Colors.black}
                        value={address}
                    />
                </View>
                <TouchableOpacity onPress={copyTxId}>
                    <View style={styles.tx}>
                        <AppText style={styles.text}>{address}</AppText>
                        <Icon
                            name="copy-outline"
                            color={Colors.white}
                            size={25}
                            style={styles.icon}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={onShare}>
                    <View style={styles.share}>
                        <Icon
                            name="share-social"
                            color={Colors.white}
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
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.appBackground,
        margin: 20,
        padding: 5,

    },
    qrCode: {
        paddingTop: 20,
        justifyContent: 'center',
        alignSelf: 'center'
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
        backgroundColor: Colors.cardBackground,
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
        color: Colors.white,
    }
});

export default ReceiveTransaction;