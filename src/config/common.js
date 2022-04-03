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


function getBitcoinDenominationUnits() {
    return units;
}

function getDefaultBitcoinDenomination() {
    const unit = units.find(u => u.name === 'BTC');
    return unit;
}

export default {
    getBitcoinDenominationUnits,
    getDefaultBitcoinDenomination
}