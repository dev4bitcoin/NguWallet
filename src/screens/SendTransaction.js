import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EditIcon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-community/clipboard';
import { Slider } from "@miblanchard/react-native-slider";
import coinSelect from 'coinselect';

import AppButtonGroup from '../components/ButtonGroup';
import Popup from '../components/Popup';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import common from '../config/common';
import Localize from '../config/Localize';
import AppButton from '../components/Button';
import routes from '../navigation/routes';
import CustomFee from './CustomFee';
import unitConverter from '../helpers/unitConverter';
import { AppContext } from '../ngu_modules/appContext';
import walletHelper from '../class/wallets/walletHelper';
import ElectrumClient from '../ngu_modules/electrumClient';
import walletDiscovery from '../helpers/walletDiscovery';
import AppActivityIndicator from '../components/AppActivityIndicator';

const amountButtons = ['25%', '50%', '75%', Localize.getLabel('max')];

function SendTransaction({ route, navigation }) {
    const { id, balance, type } = route.params;
    const [selectedIndex, setSelectedIndex] = useState();
    const [balancePopup, setBalancePopup] = useState(false);
    const { preferredBitcoinUnit } = useContext(AppContext);
    const [selectedUnit, setSelectedUnit] = useState(preferredBitcoinUnit);
    const [walletBalance, setWalletBalance] = useState(0);
    const [sendAddress, setSendAddress] = useState('');
    const [customFeeModalVisible, setCustomFeeModalVisible] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(balance);
    const [showInsufficientErrorLabel, setShowInsufficientErrorLabel] = useState(false);
    const [amountErrorMessage, setAmountErrorMessage] = useState('');
    const [showInvalidAddressLabel, setShowInvalidAddressLabel] = useState(false);
    const [feeType, setFeeType] = useState(3);
    const [customFee, setCustomFee] = useState();
    const [feeRate, setFeeRate] = useState(1);
    const [changeAddress, setChangeAddress] = useState();
    const [loading, setLoading] = useState(false);
    const [utxo, setUtxo] = useState();
    const [fee, setFee] = useState();
    const [loadingMessage, setLoadingMessage] = useState();

    const onUnitPopupClick = () => {
        setBalancePopup(true);
    }

    const handleAmountClick = (index, unit) => {
        if (index === undefined || index === null) {
            setWalletBalance(0);
            return;
        }
        let amount = 0;
        if (index === 0) {
            amount = (25 / 100) * balance;
        }
        else if (index === 1) {
            amount = (50 / 100) * balance;
        }
        else if (index === 2) {
            amount = (75 / 100) * balance;
        }
        else {
            amount = balance;
        }

        const amountBySelectedUnit = unitConverter.convertToPreferredBTCDenominator(amount, unit ? unit : selectedUnit);
        setWalletBalance(amountBySelectedUnit);
        setSelectedIndex(index);
    }

    const onUnitSelect = (item) => {
        setSelectedUnit(item);
        const btc = unitConverter.convertToPreferredBTCDenominator(balance, item)
        setAvailableBalance(btc);
        handleAmountClick(selectedIndex, item);
        setBalancePopup(false);
    }

    const onTextChange = (value) => {
        setWalletBalance(value);
        if (value > availableBalance) {
            setAmountErrorMessage(Localize.getLabel('insufficientFunds'))
            setShowInsufficientErrorLabel(true);
        }
        else {
            setShowInsufficientErrorLabel(false);
        }
        console.log(feeType);
        const rate = getFeeRate(feeType);
        console.log(rate);
        findFee(rate);

        setSelectedIndex();
    }

    const onPaste = async () => {
        const address = await Clipboard.getString();
        const isValid = walletHelper.isValidAddress(address);
        setShowInvalidAddressLabel(isValid ? false : true);
        setSendAddress(address);
    }

    const onScanFinished = (address) => {
        setSendAddress(address);
    }

    const getConfimationETA = () => {
        let label = '';
        if (feeType === 0) {
            label = Localize.getLabel('custom')
        }
        if (feeType === 1) {
            label = `~ 4 ${Localize.getLabel('hours')}`;
        }
        if (feeType === 2) {
            label = `~ 2 ${Localize.getLabel('hours')}`;
        }
        if (feeType === 3) {
            label = `~ 30 ${Localize.getLabel('minutes')}`;
        }
        return label;
    }

    const getParamsForReview = () => {
        return {
            id: id,
            type: type,
            balance: balance,
            feeRate: getFeeRate(feeType),
            sendAddress: sendAddress,
            changeAddress: changeAddress,
            utxo: utxo,
            fee: fee,
            amountToSend: walletBalance
        }
    }

    const onNext = async () => {
        if (sendAddress.trim().length == 0) {
            setShowInvalidAddressLabel(true);
        }
        if (parseFloat(walletBalance) > availableBalance) {
            setAmountErrorMessage(Localize.getLabel('insufficientFunds'))
            setShowInsufficientErrorLabel(true);
        }
        if (parseFloat(walletBalance) === 0) {
            setAmountErrorMessage(Localize.getLabel('invalidAmount'))
            setShowInsufficientErrorLabel(true);
        }

        const amountInSats = unitConverter.convertToSatoshi(parseFloat(walletBalance), selectedUnit);
        const amountToSend = amountInSats + fee;
        if (amountToSend > balance) {
            setAmountErrorMessage(Localize.getLabel('insufficientFunds'))
            setShowInsufficientErrorLabel(true);
        }

        if (!showInsufficientErrorLabel && !showInvalidAddressLabel) {
            navigation.navigate(routes.SEND_TRANSACTION_REVIEW, getParamsForReview());
        }
    }

    const getFeeRate = (type) => {
        let feeRateBySelection;
        if (type === 0) {
            feeRateBySelection = parseFloat(customFee || 1)
        }
        if (type === 1) {
            feeRateBySelection = parseFloat(feeRate.slow)
        }
        if (type === 2) {
            feeRateBySelection = parseFloat(feeRate.medium)
        }
        if (type === 3) {
            feeRateBySelection = parseFloat(feeRate.fast)
        }
        return feeRateBySelection;
    }

    const getFee = async () => {
        const fee = await ElectrumClient.estimateFees();
        setFeeRate(fee);
    }

    const getChangeAddress = async (walletClass) => {
        const address = await walletClass.getChangeAddressAsync(id);
        setChangeAddress(address);
    }

    const findFee = (feeRateBySelection) => {
        const amountInSats = unitConverter.convertToSatoshi(parseFloat(walletBalance), selectedUnit);

        const targets = [{ address: sendAddress, value: amountInSats }];

        let { fee } = coinSelect(Object.values(utxo), targets, feeRateBySelection || 1);
        const amountInSelectedUnit = unitConverter.convertToPreferredBTCDenominator(fee, selectedUnit)
        console.log(amountInSelectedUnit);
        setFee(amountInSelectedUnit);
    }

    const getUtxo = async (walletClass) => {
        const utxos = await walletClass.fetchUtxo();
        setUtxo(utxos);
    }

    const getRequiredInfo = async () => {
        setLoading(true);
        const walletClass = await walletDiscovery.getWalletInstance({ id: id, type: type });

        setLoadingMessage(Localize.getLabel('fetchingFeeMessage'));
        await getFee();

        setLoadingMessage(Localize.getLabel('fetchingAddressMessage'));
        await getChangeAddress(walletClass);

        setLoadingMessage(Localize.getLabel('fetchingUtxoMessage'));
        await getUtxo(walletClass);

        setSendAddress('2MwK73sxc87v7KGgFSLAfqqbrWykLzeqypG');
        setLoading(false);
    }

    const saveCustomFee = () => {
        setCustomFee(customFee);
        findFee(getFeeRate(feeType));
        setCustomFeeModalVisible(false)
    }

    const onSlidingComplete = async (value) => {
        setFeeType(value[0]);
        findFee(getFeeRate(value[0]));
    }

    useEffect(() => {
        const btc = unitConverter.convertToPreferredBTCDenominator(balance, selectedUnit)
        setAvailableBalance(btc);
        getRequiredInfo();
    }, [])

    return (
        <>
            <AppActivityIndicator
                message={loadingMessage}
                visible={loading} />
            <ScrollView style={styles.scrollView}>
                <View style={[styles.walletBalance]}>
                    <TextInput
                        style={styles.header}
                        onChangeText={onTextChange}
                        keyboardType='numeric'
                        returnKeyType={'done'}
                    >{walletBalance}</TextInput>
                    <AppText style={styles.errorLabel}>{showInsufficientErrorLabel ? amountErrorMessage : ''}</AppText>
                    {/* <AppButtonGroup
                    onPress={handleAmountClick}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    buttons={amountButtons} /> */}
                    <Popup
                        isModalVisible={balancePopup}
                        titleHeader={Localize.getLabel('bitcoinDenomination')}
                        onPress={() => setBalancePopup(false)}
                        items={common.getBitcoinDenominationUnits()}
                        onSelect={onUnitSelect}
                        selected={selectedUnit}
                    />
                    <View style={styles.availableBalanceContainer}>
                        {/* <TouchableOpacity onPress={onUnitPopupClick}>
                            <View style={styles.balanceContainer}>
                                <AppText style={styles.balance}>{selectedUnit?.title}</AppText>
                                <Icon
                                    name="chevron-down"
                                    color={Colors.textGray}
                                    size={16} />
                            </View>
                        </TouchableOpacity> */}
                        <AppText style={styles.remainingBalance}>{`${Localize.getLabel('availableBalance')}: ${availableBalance} ${preferredBitcoinUnit?.title}`}</AppText>
                    </View>
                </View>

                <View style={styles.recipientContainer}>
                    <AppText style={styles.label}>{Localize.getLabel('recipient')}</AppText>
                    <View style={styles.sendTo}>
                        <TextInput
                            placeholder={Localize.getLabel('enterAddress')}
                            placeholderTextColor={Colors.textGray}
                            style={styles.sendAddressInput}
                        >{sendAddress}</TextInput>
                        <TouchableOpacity onPress={onPaste}>
                            <MaterialIcon
                                name="content-paste"
                                color={Colors.white}
                                size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate(routes.SCAN, { onScanFinished })}>
                            <MaterialIcon
                                name="qrcode"
                                color={Colors.white}
                                size={22} />
                        </TouchableOpacity>
                    </View>
                    <AppText style={[styles.errorLabel, { marginBottom: 10 }]}>{showInvalidAddressLabel ? Localize.getLabel('invalidAddress') : ''}</AppText>
                </View>
                <View style={styles.feeSelection}>
                    <AppText style={[styles.feeLabel]}>{Localize.getLabel('fee')}</AppText>
                    <View style={styles.feeButtons}>
                        <TouchableOpacity onPress={() => setCustomFeeModalVisible(true)}>
                            <EditIcon
                                style={styles.editIcon}
                                name="edit"
                                color={Colors.white}
                                size={22} />
                        </TouchableOpacity>
                    </View>
                </View>
                {walletBalance > 0 &&
                    <View style={styles.calculatedFeeContainer}>
                        <AppText style={{ color: Colors.textGray }}>{`(${getFeeRate(feeType)} sat/vbyte)`}</AppText>
                        <AppText style={{ color: Colors.textGray }}>{`${fee} ${selectedUnit?.title}`}</AppText>
                    </View>
                }
                <View style={styles.confirmationETA}>
                    <AppText style={{ color: Colors.textGray }}>{Localize.getLabel('confirmationTime')}</AppText>
                    <AppText style={{ color: Colors.textGray }}>{getConfimationETA()}</AppText>
                </View>

                <View style={styles.snapsliderContainer}>
                    <Slider
                        containerStyle={styles.sliderContainer}
                        minimumValue={0}
                        maximumValue={3}
                        step={1}
                        onSlidingComplete={onSlidingComplete}
                        minimumTrackTintColor={Colors.priceGreen}
                        maximumTrackTintColor={Colors.textGray}
                        thumbTintColor={Colors.white}
                        trackClickable={true}
                        value={feeType}
                    />
                </View>
                <View style={styles.trackSteps}>
                    <AppText style={[styles.stepLabel, feeType === 0 ? styles.sliderStep : styles.feeDefault]}>{Localize.getLabel('custom')}</AppText>
                    <AppText style={[styles.stepLabel, feeType === 1 ? styles.sliderStep : styles.feeDefault, { marginRight: 25 }]}>{Localize.getLabel('low')}</AppText>
                    <AppText style={[styles.stepLabel, feeType === 2 ? styles.sliderStep : styles.feeDefault]}>{Localize.getLabel('medium')}</AppText>
                    <AppText style={[styles.stepLabel, feeType === 3 ? styles.sliderStep : styles.feeDefault]}>{Localize.getLabel('fast')}</AppText>
                </View>

                <View style={styles.reviewButton}>
                    <AppButton
                        onPress={onNext}
                        title={Localize.getLabel('next')}
                        bgColor={Colors.cardBackground}
                        rightIcon={true}
                        leftIcon={false}
                        name="chevron-right"
                        color={Colors.white} />
                </View>

                <CustomFee
                    fee={customFee}
                    setCustomFee={setCustomFee}
                    onPress={saveCustomFee}
                    customFeeModalVisible={customFeeModalVisible}
                    setCustomFeeModalVisible={setCustomFeeModalVisible} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 0,
    },
    walletBalance: {
        height: 120,
        paddingTop: 25,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        borderColor: Colors.textGray,
        borderWidth: 0.5,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        //borderTopWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 25,
        color: Colors.blue,
        fontWeight: 'bold',
        width: '80%',
        textAlign: 'center'
    },
    balance: {
        fontSize: 20,
        fontWeight: '700',
        padding: 5,
        color: Colors.textGray
    },
    availableBalanceContainer: {
        width: '80%',
        paddingLeft: 20,
        marginLeft: 20,
        marginRight: 20,
        borderColor: Colors.textGray,
    },
    balanceContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingRight: 20,
        paddingLeft: 15,
    },
    label: {
        color: Colors.gainsboro,
        paddingBottom: 10
    },
    errorLabel: {
        color: Colors.priceRed,
        marginBottom: 2,
        marginTop: 1,
        textAlign: 'center',
        height: 20
    },
    sendAddressInput: {
        width: '80%',
        color: Colors.white,
        fontSize: 18,
    },
    recipientContainer: {
        borderBottomWidth: 0.3,
        borderColor: Colors.textGray,
        margin: 20,
    },
    sendTo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 0.3,
        padding: 10,
        borderColor: Colors.textGray,
        borderRadius: 5,
        marginTop: 10
    },
    remainingBalance: {
        color: Colors.textGray,
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 0,
        textAlign: 'center'
    },
    feeSelection: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    reviewButton: {
        margin: 20,
        marginTop: 40
    },
    editIcon: {
        paddingTop: 0
    },
    feeLabel: {
        color: Colors.gainsboro,
        margin: 20,
        marginTop: 0
    },
    feeButtons: {
        flexDirection: 'row',
        marginRight: 20
    },
    snapsliderContainer: {
        margin: 20,
        marginBottom: 0,
        marginTop: 15,
    },
    trackSteps: {
        marginLeft: 20,
        marginRight: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sliderStep: {
        color: Colors.priceGreen,
        fontWeight: 'bold'
    },
    feeDefault: {
        color: Colors.textGray,
    },
    confirmationETA: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10,
        marginTop: 10
    },
    calculatedFeeContainer: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

export default SendTransaction;