import * as bitcoin from 'bitcoinjs-lib';
const ElectrumCli = require('electrum-client');
import { Alert } from 'react-native';
const reverse = require('buffer-reverse');
import BigNumber from 'bignumber.js';
import walletHelper from '../class/wallets/walletHelper';

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

function scriptLegacyPubKeyToAddress(scriptPubKey) {
    try {
        const scriptPubKey2 = Buffer.from(scriptPubKey, 'hex');
        return walletHelper.getLegacyAddress(scriptPubKey2);
    } catch (_) {
        return false;
    }
}

function scriptBech32PubKeyToAddress(scriptPubKey) {
    try {
        const scriptPubKey2 = Buffer.from(scriptPubKey, 'hex');
        return walletHelper.getBech32Address(scriptPubKey2);
    } catch (_) {
        return false;
    }
}

function scriptP2SHPubKeyToAddress(scriptPubKey) {
    try {
        const scriptPubKey2 = Buffer.from(scriptPubKey, 'hex');
        return walletHelper.getP2SHAddress(scriptPubKey2);;
    } catch (_) {
        return false;
    }
}

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

        if (scriptLegacyPubKeyToAddress(out.script.toString('hex'))) {
            address = scriptLegacyPubKeyToAddress(out.script.toString('hex'));
            type = 'witness_v0_keyhash';
        } else if (scriptBech32PubKeyToAddress(out.script.toString('hex'))) {
            address = scriptBech32PubKeyToAddress(out.script.toString('hex'));
            type = '???'; // TODO
        } else if (scriptP2SHPubKeyToAddress(out.script.toString('hex'))) {
            address = scriptP2SHPubKeyToAddress(out.script.toString('hex'));
            type = '???'; // TODO
        }

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

module.exports.broadcast = async function (hex) {
    if (!electrumClient) throw new Error('Electrum client is not connected');
    try {
        const broadcast = await electrumClient.blockchainTransaction_broadcast(hex);
        return broadcast;
    } catch (error) {
        return error;
    }
};


// Returns the value at a given percentile in a sorted numeric array.
// "Linear interpolation between closest ranks" method
function percentile(arr, p) {
    if (arr.length === 0) return 0;
    if (typeof p !== 'number') throw new TypeError('p must be a number');
    if (p <= 0) return arr[0];
    if (p >= 1) return arr[arr.length - 1];

    const index = (arr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index % 1;

    if (upper >= arr.length) return arr[lower];
    return arr[lower] * (1 - weight) + arr[upper] * weight;
}

module.exports.calcEstimateFeeFromFeeHistorgam = function (numberOfBlocks, feeHistorgram) {
    // first, transforming histogram:
    let totalVsize = 0;
    const histogramToUse = [];
    for (const h of feeHistorgram) {
        let [fee, vsize] = h;
        let timeToStop = false;

        if (totalVsize + vsize >= 1000000 * numberOfBlocks) {
            vsize = 1000000 * numberOfBlocks - totalVsize; // only the difference between current summarized size to tip of the block
            timeToStop = true;
        }

        histogramToUse.push({ fee, vsize });
        totalVsize += vsize;
        if (timeToStop) break;
    }

    // now we have histogram of precisely size for numberOfBlocks.
    // lets spread it into flat array so its easier to calculate percentile:
    let histogramFlat = [];
    for (const hh of histogramToUse) {
        histogramFlat = histogramFlat.concat(Array(Math.round(hh.vsize / 25000)).fill(hh.fee));
        // division is needed so resulting flat array is not too huge
    }

    histogramFlat = histogramFlat.sort(function (a, b) {
        return a - b;
    });

    return Math.round(percentile(histogramFlat, 0.5) || 1);
};

module.exports.estimateFees = async function () {
    let histogram;
    try {
        histogram = await Promise.race([electrumClient.mempool_getFeeHistogram(), new Promise(resolve => setTimeout(resolve, 29000))]);
    } catch (_) { }

    if (!histogram) throw new Error('timeout while getting mempool_getFeeHistogram');

    // fetching what electrum (which uses bitcoin core) thinks about fees:
    const _fast = await module.exports.estimateFee(1);
    const _medium = await module.exports.estimateFee(18);
    const _slow = await module.exports.estimateFee(144);

    // calculating fast fees from mempool:
    const fast = module.exports.calcEstimateFeeFromFeeHistorgam(1, histogram);
    // recalculating medium and slow fees using bitcoincore estimations only like relative weights:
    // (minimum 1 sat, just for any case)
    const medium = Math.max(1, Math.round((fast * _medium) / _fast));
    const slow = Math.max(1, Math.round((fast * _slow) / _fast));
    return { fast, medium, slow };
};

/**
 * Returns the estimated transaction fee to be confirmed within a certain number of blocks
 *
 * @param numberOfBlocks {number} The number of blocks to target for confirmation
 * @returns {Promise<number>} Satoshis per byte
 */
module.exports.estimateFee = async function (numberOfBlocks) {
    if (!electrumClient) throw new Error('Electrum client is not connected');
    numberOfBlocks = numberOfBlocks || 1;
    const coinUnitsPerKilobyte = await electrumClient.blockchainEstimatefee(numberOfBlocks);
    if (coinUnitsPerKilobyte === -1) return 1;
    const sat = Math.round(new BigNumber(coinUnitsPerKilobyte).dividedBy(1024).multipliedBy(100000000).toNumber());
    //console.log(sat);
    return sat;
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

