import currency from "../ngu_modules/currency";

function computeBalance(balancesByExternalIndex, balancesByInternalIndex) {
    let balance = 0;
    for (const index in balancesByExternalIndex) {
        balance += balancesByExternalIndex[index].c;
    }

    for (const index in balancesByInternalIndex) {
        balance += balancesByExternalIndex[index].c;
    }

    const btc = currency.satoshiToBTC(balance);
    return btc;
}

export default {
    computeBalance
}