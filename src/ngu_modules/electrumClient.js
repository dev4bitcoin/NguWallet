import * as bitcoin from 'bitcoinjs-lib';
const ElectrumCli = require('electrum-client');
import { Alert } from 'react-native';
const reverse = require('buffer-reverse');

const defaultPeer = { host: 'electrum1.bluewallet.io', ssl: '443' };
const predefinedPeers = [
    { host: 'electrum1.bluewallet.io', ssl: '443' },
    { host: 'electrum2.bluewallet.io', ssl: '443' },
    { host: 'electrum.acinq.co', ssl: '50002' },
    { host: 'electrum.bitaroo.net', ssl: '50002' },
];

let electrumClient;
let isClientConnected = false;
let currentPeerIndex = Math.floor(Math.random() * predefinedPeers.length);
let connectionAttempt = 0;
const gap_limit = 20;
const index = 1000;
const txhashHeightCache = {};


async function connect() {
    try {
        console.log('connect')
        const peer = await getNextPeer();

        console.log(peer)
        electrumClient = new ElectrumCli(global.net, global.tls, peer.ssl, peer.host, peer.ssl ? 'tls' : 'tcp') // tcp or tls

        const ver = await electrumClient.initElectrum({ client: 'bluewallet', version: '1.4' });

        if (ver && ver[0]) {
            console.log(`ver : ${ver}`)
            isClientConnected = true;
        }

        electrumClient.onError = (e) => {
            if (isClientConnected) {
                electrumClient.close && electrumClient.close();
                isClientConnected = false;
                console.log("Error: Close the connection")
                setTimeout(connect, 500);
            }
        }
    }
    catch (e) {
        isClientConnected = false;
        console.log(e)
    }

    if (!isClientConnected) {
        console.log('Attempt to retry');
        connectionAttempt++;
        console.log("Close the connection before attempting again");
        electrumClient.close && electrumClient.close();
        if (connectionAttempt >= 5) {
            Alert.alert('Coult not find the working electrum server. Please try again later');
        }
        else {
            console.log(`Reconnection attempt #${connectionAttempt}`)
            await new Promise(resolve => setTimeout(resolve, 500));
            return connect();
        }
    }
}

module.exports.connect = connect;

async function getCurrentPeer() {
    return predefinedPeers[currentPeerIndex];
}

async function getNextPeer() {
    const peer = getCurrentPeer();
    currentPeerIndex++;
    if (currentPeerIndex + 1 > predefinedPeers.length) {
        currentPeerIndex = 0;
    }
    return peer;
}

async function ping() {
    if (electrumClient) {
        try {
            await electrumClient.server_ping();
        }
        catch (ex) {
            isClientConnected = false;
            return false;
        }
        return true;
    }
    return false;
}



splitIntoChunks = (arr, chunkSize) => {
    const groups = [];
    let i;
    for (i = 0; i < arr.length; i += chunkSize) {
        groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
};


module.exports.multiGetHistoryByAddress = async function multiGetHistoryByAddress(addresses, batchsize) {
    batchsize = batchsize || 100;
    if (!electrumClient) throw new Error('Electrum client is not connected');
    const ret = {};

    const chunks = splitIntoChunks(addresses, batchsize);

    for (const chunk of chunks) {
        const scripthashes = [];
        const scripthash2addr = {};
        if (chunk.length == 0)
            continue;
        for (const addr of chunk) {
            const script = bitcoin.address.toOutputScript(addr);
            const hash = bitcoin.crypto.sha256(script);
            let reversedHash = Buffer.from(reverse(hash));
            reversedHash = reversedHash.toString('hex');
            scripthashes.push(reversedHash);
            scripthash2addr[reversedHash] = addr;
        }

        let results = [];
        results = await electrumClient.blockchainScripthash_getHistoryBatch(scripthashes);

        for (const history of results) {
            if (history.error) console.warn('multiGetHistoryByAddress():', history.error);
            ret[scripthash2addr[history.param]] = history.result || [];
            for (const result of history.result || []) {
                if (result.tx_hash) txhashHeightCache[result.tx_hash] = result.height; // cache tx height
            }

            for (const hist of ret[scripthash2addr[history.param]]) {
                hist.address = scripthash2addr[history.param];
            }
        }
    }
    return ret;
}

module.exports.multiGetBalanceByAddress = async function (addresses, batchsize) {
    batchsize = batchsize || 200;
    if (!electrumClient) throw new Error('Electrum client is not connected');
    const ret = { balance: 0, unconfirmed_balance: 0, addresses: {} };

    const chunks = splitIntoChunks(addresses, batchsize);

    for (const chunk of chunks) {
        const scripthashes = [];
        const scripthash2addr = {};
        if (chunk.length == 0)
            continue;
        for (const addr of chunk) {
            const script = bitcoin.address.toOutputScript(addr);
            const hash = bitcoin.crypto.sha256(script);
            let reversedHash = Buffer.from(reverse(hash));
            reversedHash = reversedHash.toString('hex');
            scripthashes.push(reversedHash);
            scripthash2addr[reversedHash] = addr;
        }

        let balances = [];
        balances = await electrumClient.blockchainScripthash_getBalanceBatch(scripthashes);
        for (const bal of balances) {
            if (bal.error) console.warn('multiGetBalanceByAddress():', bal.error);
            ret.balance += +bal.result.confirmed;
            ret.unconfirmed_balance += +bal.result.unconfirmed;
            ret.addresses[scripthash2addr[bal.param]] = bal.result;
        }
    }
    return ret;
}

module.exports.multiGetUtxoByAddress = async function (addresses, batchsize) {
    batchsize = batchsize || 100;
    if (!electrumClient) throw new Error('Electrum client is not connected');
    const ret = {};

    const chunks = splitIntoChunks(addresses, batchsize);
    for (const chunk of chunks) {
        const scripthashes = [];
        const scripthash2addr = {};
        for (const addr of chunk) {
            const script = bitcoin.address.toOutputScript(addr);
            const hash = bitcoin.crypto.sha256(script);
            let reversedHash = Buffer.from(reverse(hash));
            reversedHash = reversedHash.toString('hex');
            scripthashes.push(reversedHash);
            scripthash2addr[reversedHash] = addr;
        }

        let results = [];

        results = await electrumClient.blockchainScripthash_listunspentBatch(scripthashes);

        for (const utxos of results) {
            ret[scripthash2addr[utxos.param]] = utxos.result;
            for (const utxo of ret[scripthash2addr[utxos.param]]) {
                utxo.address = scripthash2addr[utxos.param];
                utxo.txId = utxo.tx_hash;
                utxo.vout = utxo.tx_pos;
                delete utxo.tx_pos;
                delete utxo.tx_hash;
            }
        }
    }

    return ret;
};

module.exports.index = index;
module.exports.gap_limit = gap_limit;
