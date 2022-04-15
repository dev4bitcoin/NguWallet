const bitcoin = require('bitcoinjs-lib');
const HDNode = require('bip32');

function fromSeed(seed) {
    if (global.useTestnet) {
        return HDNode.fromSeed(seed, bitcoin.networks.testnet);
    }
    return HDNode.fromSeed(seed);
}

function getLegacyAddress(publicKey) {
    let payment;
    if (global.useTestnet) {
        payment = {
            pubkey: publicKey,
            network: bitcoin.networks.testnet
        }
    }
    else {
        payment = {
            pubkey: publicKey,
        }
    }
    return bitcoin.payments.p2pkh(payment).address;
}

function getBech32Address(publicKey) {
    let payment;
    if (global.useTestnet) {
        payment = {
            pubkey: publicKey,
            network: bitcoin.networks.testnet
        }
    }
    else {
        payment = {
            pubkey: publicKey,
        }
    }
    return bitcoin.payments.p2wpkh(payment).address;
}

function getP2SHAddress(publicKey) {
    let addressToReturn;
    if (global.useTestnet) {
        const { address } = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh(
                {
                    pubkey: publicKey,
                    network: bitcoin.networks.testnet
                }),
            network: bitcoin.networks.testnet
        });
        addressToReturn = address;
    }
    else {
        const { address } = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh(
                {
                    pubkey: publicKey,
                })
        });
        addressToReturn = address;
    }
    return addressToReturn;
}

function fromBase58(xpub) {
    if (global.useTestnet) {
        return HDNode.fromBase58(xpub, bitcoin.networks.testnet);
    }
    return HDNode.fromBase58(xpub);
}

export default {
    fromSeed,
    getLegacyAddress,
    getBech32Address,
    getP2SHAddress,
    fromBase58
}