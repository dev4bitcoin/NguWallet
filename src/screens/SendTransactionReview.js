import React, { useContext, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import AppActivityIndicator from '../components/AppActivityIndicator';
import AppButton from '../components/Button';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import unitConverter from '../helpers/unitConverter';
import walletDiscovery from '../helpers/walletDiscovery';
import routes from '../navigation/routes';
import { AppContext } from '../ngu_modules/appContext';

function SendTransactionReview({ route, navigation }) {
    const { id, balance, type, fee, amountToSend, changeAddress, sendAddress, feeRate, utxo } = route.params;
    const { preferredBitcoinUnit } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    const onSend = async () => {
        setLoading(true);
        const walletClass = await walletDiscovery.getWalletInstance({ id: id, type: type });
        const amountInSats = unitConverter.convertToSatoshi(parseFloat(amountToSend), preferredBitcoinUnit);
        const targets = [{ address: sendAddress, value: parseFloat(amountInSats) }];
        const txData = walletClass.createTransaction(utxo, targets, feeRate, changeAddress, null, false, null);
        try {
            const hex = txData.tx.toHex();
            console.log(hex);
            const result = await walletClass.broadcast(hex);
            if (result) {
                setLoading(false);
                navigation.navigate(routes.SUCCESS);
            }
        }
        catch (ex) {
            Alert.alert('Error sending the transactions')
            setLoading(false);
        }
    }

    return (
        <>
            <AppActivityIndicator visible={loading} />
            < View style={styles.container}>
                <View style={styles.sendAmountContainer}>
                    <AppText style={styles.label}>{Localize.getLabel('send')}</AppText>
                    <AppText style={styles.value}>{`${amountToSend} ${preferredBitcoinUnit?.title}`}</AppText>
                </View>
                <AppText style={styles.label}>{Localize.getLabel('recipient')}</AppText>
                <AppText style={styles.value}>{sendAddress}</AppText>
                <View style={styles.feeContainer}>
                    <AppText style={styles.label}>{Localize.getLabel('fee')}</AppText>
                    <AppText style={styles.value}>{`${fee} ${preferredBitcoinUnit?.title}`}</AppText>
                </View>
                <AppText style={styles.feeRateLabel}>{`(${feeRate} sat/vbyte)`}</AppText>

                <View style={styles.sendButton}>
                    <AppButton
                        onPress={onSend}
                        title={Localize.getLabel('send')}
                        bgColor={Colors.cardBackground}
                        rightIcon={false}
                        leftIcon={false}
                        name="chevron-right"
                        color={Colors.white} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 20
    },
    sendAmountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderColor: Colors.textGray,
        borderWidth: 0.3,
        borderRadius: 5,
        marginBottom: 20
    },
    label: {
        color: Colors.gainsboro,
        paddingBottom: 10,
    },
    feeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    value: {
        color: Colors.white,
        fontWeight: 'bold',
        paddingBottom: 10,
    },
    feeRateLabel: {
        color: Colors.textGray,
        paddingBottom: 10,
        paddingTop: 0,
        textAlign: 'right'
    },
    sendButton: {
        marginTop: 40
    }
});

export default SendTransactionReview;