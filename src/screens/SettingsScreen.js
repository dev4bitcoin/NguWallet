import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

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

function SettingsScreen({ }) {
    const { preferredFiatCurrency, setPreferredBitcoinDenomination } = useContext(AppContext);
    const [btcDeniminationVisible, setBtcDeniminationVisible] = useState(false);
    const [preferredBTCUnit, setPreferredBTCUnit] = useState();

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

    useEffect(() => {
        getPreferredBTCDenomination();
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

            <AppText style={styles.header}>{Localize.getLabel('general')}</AppText>
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

            <AppText style={styles.header}>{Localize.getLabel('about')}</AppText>
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
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundDark
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
    titleContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        paddingBottom: 30
    },
    closeButton: {
        flexDirection: 'row-reverse',
        marginLeft: 10
    },
    list: {
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 5
        //paddingTop: 20
    },
});

export default SettingsScreen;