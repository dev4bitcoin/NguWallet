import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'

import Screen from '../components/Screen';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Chart from '../components/Chart';
import AppButtonGroup from '../components/ButtonGroup';
import { AppContext } from '../app_modules/appContext';
import priceApi from '../api/price'
import i18n from '../config/i18n';

const rangeButtons = ['1 D', '1 W', '1 M ', '6 M', '1 Y'];

function PriceHistory({ navigation, route }) {
    const { preferredFiatCurrency } = useContext(AppContext);
    const [priceHistory, setPriceHistory] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        getPriceHistory(0);
    }, [])

    const getRangeBySelection = (range) => {
        // define the days of price data from api provider
        // acceptable days are 1, 7, 30, 180, 365
        if (range === 0) {
            return 1;
        }
        if (range === 1) {
            return 7;
        }
        if (range === 2) {
            return 30;
        }
        if (range === 3) {
            return 180;
        }
        if (range === 4) {
            return 365;
        }
    }

    const getPriceHistory = async (range) => {
        try {
            const days = getRangeBySelection(range);
            const result = await priceApi.getHistoricalPrice(preferredFiatCurrency.endPointKey, days);
            // sample result data
            // [
            //     1594382400000 (time),
            //     1.1 (open),
            //     2.2 (high),
            //     3.3 (low),
            //     4.4 (close)
            //     ]
            if (result) {
                let priceData = [];
                result.data.forEach(price => {
                    // add close data(4.4)
                    priceData.push({ timestamp: price[0], value: price[4] });
                });
                setPriceHistory(priceData);
            }
        }
        catch (ex) {
            throw new Error(`${i18n.t("priceHistoryErrorMessage")} ${preferredFiatCurrency.endPointKey}: ${ex.message}`);
        }
    }

    const handleRangeClick = args => {
        setSelectedIndex(args);
        getPriceHistory(args);
    }

    const { price, priceChangeFromLast24Hour } = route.params;
    const isPriceDown = Math.sign(priceChangeFromLast24Hour) === -1;
    return (
        <Screen style={styles.container}>
            <View>
                <AppText style={styles.header}>{i18n.t('currentPrice')}</AppText>
                <View style={styles.currentPriceContainer}>
                    <AppText style={styles.price}>{preferredFiatCurrency.symbol}{price}</AppText>
                    <MaterialCommunityIcons
                        name={isPriceDown ? "menu-down" : "menu-up"}
                        size={25}
                        color={isPriceDown ? Colors.priceRed : Colors.priceGreen}
                        style={styles.icon} />
                    <AppText
                        style={[styles.price, isPriceDown ? styles.priceDown : styles.priceUp]}>
                        {parseFloat(priceChangeFromLast24Hour, 10).toFixed(2)}
                    </AppText>
                </View>
                <Chart
                    preferredFiatCurrency={preferredFiatCurrency}
                    priceHistory={priceHistory}
                />
                <AppButtonGroup
                    onPress={handleRangeClick}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    buttons={rangeButtons} />
                {/* <View style={styles.balanceArea}>
                    <View style={styles.detailsContainer}>
                        <AppText style={styles.text}>{i18n.t('balance')}</AppText>
                        <AppText style={[styles.text, styles.bottomRowText]}>{`${i18n.t('in')} ${preferredFiatCurrency.endPointKey}`}</AppText>
                    </View>
                    <View style={[styles.detailsContainer, styles.balanceContainer]}>
                        <AppText style={[styles.text, styles.textAlign]}>0.00</AppText>
                        <AppText style={[styles.text, styles.textAlign, styles.bottomRowText]}>{preferredFiatCurrency.symbol}0.00</AppText>
                    </View>
                </View> */}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        color: '#fff',
        fontSize: 22,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 20,
        color: '#6d767f',
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        padding: 5,
        color: Colors.white

    },
    priceUp: {
        color: Colors.priceGreen
    },
    priceDown: {
        color: Colors.priceRed
    },
    currentPriceContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 20,
        paddingLeft: 15,
    },
    detailsContainer: {
        width: '50%'
    },
    balanceArea: {
        flexDirection: 'row',
        paddingRight: 20,
        paddingLeft: 20,
    },
    text: {
        color: '#fff',
        fontSize: 20,
        padding: 5,
        fontWeight: '700',
    },
    textAlign: {
        textAlign: 'right'
    },
    bottomRowText: {
        color: '#6d767f'
    }
});

export default PriceHistory;