import React, { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { format, fromUnixTime } from 'date-fns'
import Clipboard from '@react-native-community/clipboard';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import AppModal from '../components/Modal';
import { AppContext } from '../ngu_modules/appContext';
import unitConverter from '../helpers/unitConverter';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function TransactionDetail({ route, navigation }) {
    const { txid, value, time, confirmations } = route.params.tx;
    const [isModalVisible, setModalVisible] = useState(false);
    const { preferredBitcoinUnit } = useContext(AppContext);

    const isSent = Math.sign(value) === -1;
    const btc = unitConverter.convertToPreferredBTCDenominator(value, preferredBitcoinUnit);
    const formattedTime = format(fromUnixTime(time), 'PPp');

    navigation.setOptions({
        title: `${isSent ? Localize.getLabel('sent') : Localize.getLabel('received')} ${Localize.getLabel('on')} ${route.params.walletName}`,
    })

    const getTransactionStatus = () => {
        if (confirmations === 0) {
            return Localize.getLabel('unconfirmed');
        }
        else if (confirmations > 0 && confirmations < 6) {
            return Localize.getLabel('pendingConfirmation');
        }
        else if (confirmations >= 6) {
            return Localize.getLabel('completed');
        }
    }

    const getTransactionStatusStyle = () => {
        if (confirmations === 0) {
            return styles.red;
        }
        else if (confirmations > 0 && confirmations < 6) {
            return styles.pending;
        }
        else if (confirmations >= 6) {
            return styles.green;
        }
    }

    const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false
    };

    const copyTxId = async () => {
        ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
        Clipboard.setString(txid);
        setModalVisible(true);
        await sleep(1000);
        setModalVisible(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.txTime}>
                <View style={styles.balanceContainer}>
                    <AppText style={styles.transactionTypeText}>{isSent ? Localize.getLabel('sent') : Localize.getLabel('received')}</AppText>
                    <AppText style={[styles.value, isSent ? styles.red : styles.white]}>{btc} {preferredBitcoinUnit?.title}</AppText>
                </View>
                <View style={styles.txConfirmationDetail}>
                    <View style={styles.confirmationText}>
                        <AppText numberOfLines={1} style={styles.time}>{formattedTime}</AppText>
                        <AppText style={[styles.isConfirmedText, getTransactionStatusStyle()]}>
                            {getTransactionStatus()}
                        </AppText>
                    </View>
                    {confirmations >= 6 &&
                        <View style={styles.confirmed}>
                            <AntDesignIcon
                                name="checkcircleo"
                                size={50}
                                color={Colors.priceGreen}
                                style={styles.confirmationIcon} />
                        </View>
                    }
                </View>
            </View>
            <AppText style={styles.header}>{Localize.getLabel('transactionDetails')}</AppText>

            <AppText style={styles.subHeader}>{Localize.getLabel('confirmations')}</AppText>
            <AppText style={styles.text}>{confirmations}</AppText>

            <AppText style={styles.subHeader}>{Localize.getLabel('transactionId')}</AppText>

            <TouchableOpacity onPress={copyTxId}>
                <View style={styles.tx}>
                    <AppText style={styles.text}>{txid}</AppText>
                    <Icon
                        name="copy-outline"
                        color={Colors.white}
                        size={25}
                        style={styles.icon}
                    />
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
        padding: 20
    },
    balanceContainer: {
        paddingBottom: 20,
        borderColor: Colors.textGray,
        borderBottomWidth: 0.3,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    transactionTypeText: {
        fontSize: 22,
        paddingBottom: 10,
        paddingTop: 10,
        color: Colors.bottomRowText,
    },
    value: {
        fontSize: 22,
        paddingBottom: 10,
        paddingTop: 10,
        fontWeight: 'bold',
        color: Colors.white
    },
    white: {
        color: Colors.white
    },
    green: {
        color: Colors.priceGreen
    },
    red: {
        color: Colors.priceRed
    },
    pending: {
        color: Colors.gainsboro
    },
    txTime: {
        borderColor: Colors.textGray,
        borderWidth: 0.3,
        borderRadius: 5,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        padding: 20,

    },
    time:
    {
        fontSize: 18,
        color: Colors.white,
    },
    isConfirmedText: {
        fontSize: 25,
        fontWeight: 'bold',
        paddingTop: 10,
        color: Colors.white,
    },
    progress: {
        paddingLeft: 20,
    },
    header: {
        fontSize: 22,
        paddingBottom: 10,
        paddingTop: 30,
        fontWeight: 'bold',
        color: Colors.white
    },
    subHeader: {
        fontSize: 20,
        paddingBottom: 10,
        paddingTop: 10,
        color: Colors.bottomRowText,
    },
    text: {
        fontSize: 19,
        paddingBottom: 10,
        fontWeight: 'bold',
        color: Colors.white,
        width: '88%'
    },
    tx: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    icon: {
        paddingTop: 15
    },
    confirmationIcon: {
        paddingTop: 10
    },
    txConfirmationDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 30
    },
    confirmationText: {
        width: '78%'
    },
    confirmed: {
        paddingLeft: 20,

    }
});

export default TransactionDetail;