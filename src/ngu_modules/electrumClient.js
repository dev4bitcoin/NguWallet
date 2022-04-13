import * as bitcoin from 'bitcoinjs-lib';
const ElectrumCli = require('electrum-client');
import { Alert } from 'react-native';
const reverse = require('buffer-reverse');
import BigNumber from 'bignumber.js';


const defaultPeer = { host: 'electrum1.bluewallet.io', ssl: '443' };
const predefinedPeers = [
    { host: 'electrum1.bluewallet.io', ssl: '443' },
    { host: 'electrum2.bluewallet.io', ssl: '443' },
    { host: 'electrum.acinq.co', ssl: '50002' },
    { host: 'electrum.bitaroo.net', ssl: '50002' },
];

const predefinedTestnetPeers = [
    { host: 'testnet.hsmiths.com', ssl: '53012' },
    { host: 'testnet.qtornado.com', ssl: '51002' },
    // { host: 'electrum.blockstream.info', ssl: '60002' },
    // { host: 'blockstream.info', tcp: '143' },
    // { host: 'blockstream.info', ssl: '993' },
];

let electrumClient;
let isClientConnected = false;
let currentPeerIndex = Math.floor(Math.random() * predefinedPeers.length);
let connectionAttempt = 0;
let usingPeer;
const gap_limit = 20;
const index = 1000;
const txhashHeightCache = {};


async function connect() {
    const peer = await getNextPeer();
    try {
        console.log('connect')

        console.log(peer)
        electrumClient = new ElectrumCli(global.net, global.tls, peer.ssl, peer.host, peer.ssl ? 'tls' : 'tcp') // tcp or tls
        usingPeer = `${peer.host}:${peer.ssl}`;

        electrumClient.onError = (e) => {
            console.log('electrum mainClient.onError():', e.message);

            if (isClientConnected) {
                electrumClient.close && electrumClient.close();
                isClientConnected = false;
                console.log("Error: Close the connection")
                setTimeout(connect, 500);
            }
        }

        const ver = await electrumClient.initElectrum({ client: 'nguwallet', version: '1.4' });

        if (ver && ver[0]) {
            console.log(`ver : ${ver}`);
            serverName = ver[0];
            isClientConnected = true;
        }
    }
    catch (e) {
        isClientConnected = false;
        console.log('bad connection:', JSON.stringify(peer), e)
    }

    if (!isClientConnected) {
        console.log('Attempt to retry');
        connectionAttempt = connectionAttempt + 1;
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
    return global.useTestnet ? predefinedTestnetPeers[currentPeerIndex] : predefinedPeers[currentPeerIndex];
}

async function getNextPeer() {
    const peer = getCurrentPeer();
    currentPeerIndex++;
    if (currentPeerIndex + 1 > predefinedPeers.length) {
        currentPeerIndex = 0;
    }
    return peer;
}

module.exports.ping = async function ping() {
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
            const script = bitcoin.address.toOutputScript(addr, this.getNetworkType());
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
            const script = bitcoin.address.toOutputScript(addr, this.getNetworkType());
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
            const script = bitcoin.address.toOutputScript(addr, this.getNetworkType());
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

module.exports.multiGetTransactionByTxid = async function (txids, batchsize, verbose = true) {
    batchsize = batchsize || 45;
    // this value is fine-tuned so althrough wallets in test suite will occasionally
    // throw 'response too large (over 1,000,000 bytes', test suite will pass
    if (!electrumClient) throw new Error('Electrum client is not connected');
    const ret = {};
    txids = [...new Set(txids)]; // deduplicate just for any case

    const chunks = splitIntoChunks(txids, batchsize);
    for (const chunk of chunks) {
        let results = [];

        results = await electrumClient.blockchainTransaction_getBatch(chunk, verbose);

        for (const txdata of results) {
            if (txdata.error && txdata.error.code === -32600) {
                // response too large
                // lets do single call, that should go through okay:
                txdata.result = await electrumClient.blockchainTransaction_get(txdata.param, false);
                // since we used VERBOSE=false, server sent us plain txhex which we must decode on our end:
                txdata.result = txhexToElectrumTransaction(txdata.result);
            }
            ret[txdata.param] = txdata.result;
            if (ret[txdata.param]) delete ret[txdata.param].hex; // compact
        }
    }

    // in bitcoin core 22.0.0+ they removed `.addresses` and replaced it with plain `.address`:
    for (const txid of Object.keys(ret) ?? []) {
        for (const vout of ret[txid].vout ?? []) {
            if (vout?.scriptPubKey?.address) vout.scriptPubKey.addresses = [vout.scriptPubKey.address];
        }
    }

    return ret;
};

function txhexToElectrumTransaction(txhex) {
    const tx = bitcoin.Transaction.fromHex(txhex);

    const ret = {
        txid: tx.getId(),
        hash: tx.getId(),
        version: tx.version,
        size: Math.ceil(txhex.length / 2),
        vsize: tx.virtualSize(),
        weight: tx.weight(),
        locktime: tx.locktime,
        vin: [],
        vout: [],
        hex: txhex,
        blockhash: '',
        confirmations: 0,
        time: 0,
        blocktime: 0,
    };

    for (const inn of tx.ins) {
        const txinwitness = [];
        if (inn.witness[0]) txinwitness.push(inn.witness[0].toString('hex'));
        if (inn.witness[1]) txinwitness.push(inn.witness[1].toString('hex'));

        ret.vin.push({
            txid: reverse(inn.hash).toString('hex'),
            vout: inn.index,
            scriptSig: { hex: inn.script.toString('hex'), asm: '' },
            txinwitness,
            sequence: inn.sequence,
        });
    }

    let n = 0;
    for (const out of tx.outs) {
        const value = new BigNumber(out.value).dividedBy(100000000).toNumber();
        let address = '';
        let type = '';

        const scriptPubKey2 = Buffer.from(out.script.toString('hex'), 'hex');
        address = bitcoin.payments.p2pkh({
            output: scriptPubKey2,
            network: this.getNetworkType(),
        }).address;


        // if (SegwitBech32Wallet.scriptPubKeyToAddress(out.script.toString('hex'))) {
        //     address = SegwitBech32Wallet.scriptPubKeyToAddress(out.script.toString('hex'));
        //     type = 'witness_v0_keyhash';
        // } else if (SegwitP2SHWallet.scriptPubKeyToAddress(out.script.toString('hex'))) {
        //     address = SegwitP2SHWallet.scriptPubKeyToAddress(out.script.toString('hex'));
        //     type = '???'; // TODO
        // } else if (LegacyWallet.scriptPubKeyToAddress(out.script.toString('hex'))) {
        //     address = LegacyWallet.scriptPubKeyToAddress(out.script.toString('hex'));
        //     type = '???'; // TODO
        // }

        ret.vout.push({
            value,
            n,
            scriptPubKey: {
                asm: '',
                hex: out.script.toString('hex'),
                reqSigs: 1, // todo
                type,
                addresses: [address],
            },
        });
        n++;
    }
    return ret;
}

module.exports.getTransactionsByAddress = async function (address) {
    if (!electrumClient) throw new Error('Electrum client is not connected');
    const script = bitcoin.address.toOutputScript(address, this.getNetworkType());
    const hash = bitcoin.crypto.sha256(script);
    const reversedHash = Buffer.from(reverse(hash));
    const history = await electrumClient.blockchainScripthash_getHistory(reversedHash.toString('hex'));
    return history;
};

module.exports.getNetworkType = function () {
    const networkType = global.useTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    return networkType;
}

module.exports.getServerInfo = function () {
    return usingPeer;
}

module.exports.index = index;
module.exports.gap_limit = gap_limit;

