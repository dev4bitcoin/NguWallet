import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import ToggleSwitch from 'toggle-switch-react-native';
import ReactNativeBiometrics from 'react-native-biometrics'
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const ElectrumClient = require('../ngu_modules/electrumClient');

import packageJson from '../../package.json'
import ListItem from '../components/ListItem';
import Screen from '../components/Screen';
import Colors from '../config/Colors';
import AppText from '../components/Text';
import { AppContext } from '../ngu_modules/appContext';
import routes from '../navigation/routes';
import Localize from '../config/Localize';
import Popup from '../components/Popup';
import common from '../config/common';
import currency from '../ngu_modules/currency';
import AppAlert from '../components/AppAlert';

function SettingsScreen({ }) {
    const {
        preferredFiatCurrency,
        setPreferredBitcoinDenomination,
        setPriceCardDisplayStatus,
        showPriceCardInHomeScreen,
        setBiometricsStatus,
        showBiometrics,
        showExplorerScreen,
        setExplorerScreenStatus
    } = useContext(AppContext);

    const [btcDeniminationVisible, setBtcDeniminationVisible] = useState(false);
    const [preferredBTCUnit, setPreferredBTCUnit] = useState();
    const [isElectrumServerOnline, setIsElectrumServerOnline] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false
    }

    const navigation = useNavigation();

    const onBtcDenominationClick = () => {
        setBtcDeniminationVisible(true);
    }

    const onClose = () => {
        setBtcDeniminationVisible(false);
    }

    const onSelect = async (item) => {
        await currency.setPreferredBitcoinDenomination(item);
        setPreferredBTCUnit(item);
        setPreferredBitcoinDenomination();
        setBtcDeniminationVisible(false);
    }

    const getPreferredBTCDenomination = async () => {
        const unit = await currency.getPreferredBitcoinDenomination();
        setPreferredBTCUnit(unit);
        return unit;
    }

    const onHidePriceCard = async (isOn) => {
        ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
        await setPriceCardDisplayStatus(isOn);
    }

    const onExplorerStatusChange = async (isOn) => {
        ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
        await setExplorerScreenStatus(isOn);
    }

    const isBiometricsSupported = async () => {
        let isSupported = false;
        const resultObject = await ReactNativeBiometrics.isSensorAvailable();
        const { available, biometryType } = resultObject;

        if (available && biometryType === ReactNativeBiometrics.TouchID) {
            isSupported = true;
        } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
            isSupported = true;
        } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
            isSupported = true;
        } else {
            isSupported = false;
        }

        return isSupported;
    }

    const onBioMetricsStatusChanged = async (isOn) => {
        ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);

        const isSupported = await isBiometricsSupported();

        if (isSupported && isOn === true) {
            await setBiometricsStatus(isOn);
            return;
        }
        else if (isSupported && isOn === false) {
            await setBiometricsStatus(false);
        }
        else {
            await setBiometricsStatus(false);
            setShowAlert(true);
        }
    }

    const checkIfElectrumServerOnline = async () => {
        const isOnline = await ElectrumClient.ping();
        setIsElectrumServerOnline(isOnline);
    }

    useEffect(() => {
        getPreferredBTCDenomination();
        checkIfElectrumServerOnline();
    }, [])

    return (
        <Screen style={styles.container}>
            <View style={styles.titleContainer}>
                <AppText style={[styles.header, styles.headerAlignment]}>{Localize.getLabel('settings')}</AppText>
                <View style={styles.closeButton}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.HOME)}>
                        <Icon
                            name="close"
                            size={25}
                            color={Colors.white}
                            style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.headerBorder}>
                    <AppText style={[styles.subheader]}>{Localize.getLabel('general')}</AppText>
                </View>
                <View style={styles.list}>
                    <ListItem
                        title={Localize.getLabel('referenceExhangeRate')}
                        subTitle={preferredFiatCurrency.endPointKey}
                        onPress={() => navigation.navigate(routes.CURRECNCY_SELECTION, preferredFiatCurrency)}
                        showChevrons={true}
                    />
                </View>

                <View style={styles.list}>
                    <ListItem
                        title={Localize.getLabel('bitcoinDenomination')}
                        subTitle={preferredBTCUnit?.title}
                        onPress={onBtcDenominationClick}
                        showChevrons={true}
                    />
                </View>
                <View style={styles.headerBorder}>
                    <AppText style={[styles.subheader]}>{Localize.getLabel('home')}</AppText>
                </View>

                <View style={styles.toggle}>
                    <View style={styles.toggleTextArea}>
                        <AppText style={[styles.toggleHeader, styles.toggleHeaderPadding]}>{Localize.getLabel('showPriceCard')}</AppText>
                    </View>
                    <ToggleSwitch
                        isOn={showPriceCardInHomeScreen}
                        onColor={Colors.priceGreen}
                        offColor={Colors.medium}
                        size="large"
                        onToggle={onHidePriceCard}
                    />
                </View>

                <View style={styles.toggle}>
                    <View style={styles.toggleTextArea}>
                        <AppText style={[styles.toggleHeader, styles.toggleHeaderPadding]}>{Localize.getLabel('showExplorerScreen')}</AppText>
                    </View>
                    <ToggleSwitch
                        isOn={showExplorerScreen}
                        onColor={Colors.priceGreen}
                        offColor={Colors.medium}
                        size="large"
                        onToggle={onExplorerStatusChange}
                    />
                </View>
                <View style={styles.headerBorder}>
                    <AppText style={[styles.subheader]}>{Localize.getLabel('security')}</AppText>
                </View>
                <View style={styles.toggle}>
                    <View style={styles.toggleTextArea}>
                        <AppText style={[styles.toggleHeader, styles.toggleHeaderPadding]}>{Localize.getLabel(Platform.OS === 'android' ? 'biometrics' : 'touchId')}</AppText>
                    </View>
                    <ToggleSwitch
                        isOn={showBiometrics}
                        onColor={Colors.priceGreen}
                        offColor={Colors.medium}
                        size="large"
                        onToggle={onBioMetricsStatusChanged}
                    />
                </View>

                <View style={styles.list}>
                    <ListItem
                        title={Localize.getLabel('networkStatus')}
                        subTitle={isElectrumServerOnline ? Localize.getLabel('connected') : Localize.getLabel('notConnected')}
                        showChevrons={true}
                        onPress={() => navigation.navigate(routes.NETWORK_STATUS)}
                    />
                </View>
                <View style={styles.headerBorder}>
                    <AppText style={[styles.subheader]}>{Localize.getLabel('about')}</AppText>
                </View>
                <View style={styles.list}>
                    <ListItem
                        title={Localize.getLabel('version')}
                        subTitle={`${Localize.getLabel('version')}: ${packageJson.version}`}
                        showChevrons={false}
                    />
                </View>
                <Popup
                    isModalVisible={btcDeniminationVisible}
                    titleHeader={Localize.getLabel('bitcoinDenomination')}
                    onPress={onClose}
                    items={common.getBitcoinDenominationUnits()}
                    onSelect={onSelect}
                    selected={preferredBTCUnit}
                />
            </ScrollView>
            <AppAlert
                visible={showAlert}
                isAlert={true}
                title=''
                message={Localize.getLabel('biometricsNotSupported')}
                onCancel={() => setShowAlert(false)}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.appBackground
    },
    header: {
        color: Colors.white,
        fontWeight: 'bold',
        width: '90%',
        fontSize: 20,
        paddingLeft: 20,
        paddingBottom: 10,
        paddingTop: 10
    },
    headerAlignment: {
        textAlign: 'center',
        paddingLeft: 30,
        fontWeight: '600'
    },
    headerBorder: {
        borderBottomColor: Colors.textGray,
        borderBottomWidth: 0.3,
        marginLeft: 20,
        marginRight: 20,
    },
    subheader: {
        color: Colors.blue,
        fontWeight: 'bold',
        width: '90%',
        fontSize: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    titleContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        paddingBottom: 10
    },
    closeButton: {
        flexDirection: 'row-reverse',
        marginLeft: 10,
        marginTop: 12
    },
    list: {
        paddingLeft: 15,
        paddingRight: 15,
    },
    toggle: {
        padding: 20,
        paddingLeft: 5,
        backgroundColor: Colors.appBackground,
        marginBottom: 10,
        marginTop: 0,
        marginLeft: 15,
        marginRight: 15,
        flexDirection: 'row',
        // borderBottomColor: Colors.textGray,
        // borderBottomWidth: 0.3
    },
    toggleTextArea: {
        width: '75%',
        marginRight: 20
    },
    toggleHeader: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    toggleHeaderPadding: {
        paddingTop: 7
    },
    scrollView: {
        marginBottom: 80
    }
});

export default SettingsScreen;