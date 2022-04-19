import BigNumber from "bignumber.js";

function satoshiToBTC(satoshi) {
    return new BigNumber(satoshi).dividedBy(100000000).toString(10);
}

function satoshiToMBTC(satoshi) {
    return new BigNumber(satoshi).dividedBy(100000).toNumber();
}

function satoshiToBits(satoshi) {
    return new BigNumber(satoshi).dividedBy(100).toNumber();
}

function btcToSatoshi(btc) {
    return new BigNumber(btc).multipliedBy(100000000).toString(10);
}

function mBTCToSatoshi(mBTC) {
    return new BigNumber(mBTC).multipliedBy(100000).toNumber();
}

function bitsToSatoshi(satoshi) {
    return new BigNumber(satoshi).multipliedBy(100).toNumber();
}


function convertToPreferredBTCDenominator(satoshi, preferredBTCUnit) {
    if (preferredBTCUnit?.name === 'BTC') {
        return satoshiToBTC(satoshi);
    }
    else if (preferredBTCUnit?.name === 'mBTC') {
        return satoshiToMBTC(satoshi);
    }
    else if (preferredBTCUnit?.name === 'BITS') {
        return satoshiToBits(satoshi);
    }
    else {
        return satoshi;
    }
}


function convertToSatoshi(amount, unit) {
    if (unit?.name === 'BTC') {
        return btcToSatoshi(amount);
    }
    else if (unit?.name === 'mBTC') {
        return mBTCToSatoshi(amount);
    }
    else if (unit?.name === 'BITS') {
        return bitsToSatoshi(amount);
    }
    else {
        return amount;
    }
}

function getFiatAmountForBTC(satoshi, fiat) {
    const btc = satoshiToBTC(satoshi);
    const amountInFiat = (btc / 1) * fiat;
    return amountInFiat.toFixed(2);
}

export default {
    convertToPreferredBTCDenominator,
    getFiatAmountForBTC,
    convertToSatoshi
}