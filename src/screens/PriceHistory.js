import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Screen from '../components/Screen';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Chart from '../components/Chart';
import AppButtonGroup from '../components/ButtonGroup';
import { AppContext } from '../ngu_modules/appContext';
import priceApi from '../api/price'
import Localize from '../config/Localize';
import currency from '../ngu_modules/currency';
import unitConverter from '../helpers/unitConverter';

const rangeButtons = ['1 D', '1 W', '1 M ', '6 M', '1 Y'];

function PriceHistory() {
    const { preferredFiatCurrency, latestPrice, totalWalletBalance, preferredBitcoinUnit } = useContext(AppContext);
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
            const preferredCurrency = await currency.getPreferredCurrency();

            const result = await priceApi.getHistoricalPrice(preferredCurrency.endPointKey.toLowerCase(), days);
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
            throw new Error(`${Localize.getLabel("priceHistoryErrorMessage")} ${preferredCurrency.endPointKey}: ${ex.message}`);
        }
    }

    const handleRangeClick = args => {
        setSelectedIndex(args);
        getPriceHistory(args);
    }

    const { price, priceChangeFromLast24Hour } = latestPrice;
    const isPriceDown = Math.sign(priceChangeFromLast24Hour) === -1;
    const btc = unitConverter.convertToPreferredBTCDenominator(totalWalletBalance, preferredBitcoinUnit);
    const fiat = unitConverter.getFiatAmountForBTC(totalWalletBalance, price);

    return (
        <Screen style={styles.container}>
            <View>
                <AppText style={styles.header}>{Localize.getLabel('currentPrice')}</AppText>
                <View style={styles.currentPriceContainer}>
                    <AppText style={styles.price}>{preferredFiatCurrency.symbol}{price}</AppText>
                    <Icon
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
                <View style={styles.range}>
                    <AppButtonGroup
                        onPress={handleRangeClick}
                        selectedIndex={selectedIndex}
                        setSelectedIndex={setSelectedIndex}
                        buttons={rangeButtons} />
                </View>
                <View style={styles.balanceArea}>
                    <View style={styles.detailsContainer}>
                        <AppText style={styles.text}>{Localize.getLabel('totalBalance')}</AppText>
                        <AppText style={[styles.text, styles.bottomRowText]}>{`${Localize.getLabel('in')} ${preferredFiatCurrency.endPointKey}`}</AppText>
                    </View>
                    <View style={[styles.detailsContainer, styles.balanceContainer]}>
                        <AppText style={[styles.text, styles.textAlign]}>{btc} {preferredBitcoinUnit?.title}</AppText>
                        <AppText style={[styles.text, styles.textAlign, styles.bottomRowText]}>{preferredFiatCurrency.symbol}{fiat}</AppText>
                    </View>
                </View>
            </View>
        </Screen >
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 22,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 20,
        color: Colors.textGray,
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
        marginTop: 30
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
    },
    range: {
        marginTop: 20,
        borderBottomWidth: 0.3,
        borderBottomColor: Colors.light,
    }
});

export default PriceHistory;