import walletType from "../class/wallets/walletType";
import Colors from "./Colors";
import Localize from "./Localize";

const units = [{
    title: Localize.getLabel('btc'),
    name: 'BTC',
    id: 1
},
{
    title: Localize.getLabel('mBtc'),
    name: 'mBTC',
    id: 2
},
{
    title: Localize.getLabel('bits'),
    name: 'BITS',
    id: 3
},
{
    title: Localize.getLabel('sats'),
    name: 'SATS',
    id: 4
}]

const walletList = [
    { id: 1, title: Localize.getLabel('hdSegwitBech32'), value: walletType.HD_SEGWIT_Bech32 },
    { id: 2, title: Localize.getLabel('hdSegwitP2SH'), value: walletType.HD_SEGWIT_P2SH },
    { id: 3, title: Localize.getLabel('hdLegacyP2PKH'), value: walletType.HD_LEGACY_P2PKH },
];

function getDefaultWallectType() {
    return { id: 1, title: Localize.getLabel('hdSegwitBech32'), value: walletType.HD_SEGWIT_Bech32 };
}

function getBitcoinDenominationUnits() {
    return units;
}

function getDefaultBitcoinDenomination() {
    const unit = units.find(u => u.name === 'BTC');
    return unit;
}

function getWalletTypes() {
    return walletList;
}

function getBgColorByWalletType(type) {
    let colorCode = '';
    if (type === walletType.WATCH_ONLY) {
        colorCode = Colors.watchOnly;
    }
    else {
        colorCode = Colors.darkBlue;
    }

    return colorCode;
}

export default {
    getBitcoinDenominationUnits,
    getDefaultBitcoinDenomination,
    getWalletTypes,
    getBgColorByWalletType,
    getDefaultWallectType
}