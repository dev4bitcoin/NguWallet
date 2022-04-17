import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-community/clipboard';

import AppButtonGroup from '../components/ButtonGroup';
import Popup from '../components/Popup';
import Screen from '../components/Screen';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import common from '../config/common';
import Localize from '../config/Localize';
import AppButton from '../components/Button';
import routes from '../navigation/routes';

const amountButtons = ['25%', '50%', '75%', Localize.getLabel('max')];

function SendTransaction({ route, navigation }) {
    const { id, balance, type } = route.params;
    const [selectedIndex, setSelectedIndex] = useState();
    const [balancePopup, setBalancePopup] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(common.getDefaultBitcoinDenomination());
    const [walletBalance, setWalletBalance] = useState(0);
    const [sendAddress, setSendAddress] = useState();

    const onUnitPopupClick = () => {
        setBalancePopup(true);
    }

    const handleAmountClick = index => {
        setWalletBalance(25);
        setSelectedIndex(index);
    }

    const onUnitSelect = (item) => {
        setSelectedUnit(item);
        setBalancePopup(false);
    }

    const onTextChange = (value) => {
        setSelectedIndex();
    }

    const onPaste = async () => {
        const address = await Clipboard.getString();
        setSendAddress(address);
    }

    const OnFeeSelect = () => {

    }

    const onScanFinished = (address) => {
        setSendAddress(address);
    }

    return (
        <Screen style={styles.screen}>
            <View style={[styles.walletBalance]}>
                <TextInput
                    style={styles.header}
                    onChangeText={onTextChange}
                    keyboardType='numeric'
                >{walletBalance}</TextInput>
                <TouchableOpacity onPress={onUnitPopupClick}>
                    <View style={styles.balanceContainer}>
                        <AppText style={styles.balance}>{selectedUnit?.title}</AppText>
                        <Icon
                            name="chevron-down"
                            color={Colors.textGray}
                            size={16} />
                    </View>
                </TouchableOpacity>
                <AppButtonGroup
                    onPress={handleAmountClick}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    buttons={amountButtons} />
                <Popup
                    isModalVisible={balancePopup}
                    titleHeader={Localize.getLabel('bitcoinDenomination')}
                    onPress={() => setBalancePopup(false)}
                    items={common.getBitcoinDenominationUnits()}
                    onSelect={onUnitSelect}
                    selected={selectedUnit}
                />
            </View>
            <AppText style={styles.remainingBalance}>{`${Localize.getLabel('availableBalance')}: ${balance}`}</AppText>
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
            <View style={styles.feeSelection}>
                <AppText style={styles.label}>{Localize.getLabel('fee')}</AppText>
                <TouchableOpacity onPress={OnFeeSelect}>
                    <View style={styles.feeText}>
                        <AppText style={styles.fee}>1 sat/vByte</AppText>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.sendButton}>
                <AppButton
                    onPress={() => navigation.navigate(routes.SEED, getWalletInputInfo())}
                    title={Localize.getLabel('send')}
                    //disabled={walletBalance.length > 0 ? false : true}
                    bgColor={Colors.cardBackground}
                    color={Colors.white} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    walletBalance: {
        height: 160,
        margin: 20,
        marginBottom: 0,
        borderColor: Colors.textGray,
        borderWidth: 0.3,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 25,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 10,
        color: Colors.blue,
        fontWeight: 'bold'
    },
    balance: {
        fontSize: 20,
        fontWeight: '700',
        padding: 5,
        color: Colors.textGray
    },
    balanceContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 20,
        paddingLeft: 15,
    },
    label: {
        color: Colors.gainsboro,
        margin: 20,
    },
    sendAddressInput: {
        width: '80%',
        color: Colors.white,
        fontSize: 18,
    },
    sendTo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.3,
        marginLeft: 20,
        marginRight: 20,
        paddingBottom: 5,
        marginBottom: 10,
        borderColor: Colors.textGray,
    },
    remainingBalance: {
        color: Colors.textGray,
        marginTop: 5,
        marginLeft: 0,
        textAlign: 'center'
    },
    feeSelection: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sendButton: {
        margin: 20,
        marginTop: 40
    },
    feeText: {
        borderRadius: 3,
        backgroundColor: Colors.blue,
        alignSelf: 'flex-start',
        padding: 1,
        paddingRight: 4,
        paddingLeft: 4,
        marginRight: 20,
        marginTop: 15,
    },
    fee: {
        color: Colors.white,
    }
});

export default SendTransaction;