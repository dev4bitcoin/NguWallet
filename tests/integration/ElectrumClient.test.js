import * as bitcoin from 'bitcoinjs-lib';
import assert from 'assert';

import ElectrumClient from 'electrum-client';
// import BIP32Factory from 'bip32';
// import * as ecc from 'tiny-secp256k1';
const b58 = require('bs58check')
const reverse = require('buffer-reverse');

// You must wrap a tiny-secp256k1 compatible implementation
const HDNode = require('bip32');

//const HDNode = require('bip32');

//import '../../shim.js'
//jasmine.DEFAULT_TIMEOUT_INTERVAL = 150 * 1000;

const network = bitcoin.networks.testnet;
//const net = require('../../src/ngu_modules/net');
//const tls = require('../../src/ngu_modules/tls');

const hardcodedPeers = [
    { host: 'electrum1.bluewallet.io', ssl: '443' },
    { host: 'electrum2.bluewallet.io', ssl: '443' },
    { host: 'electrum3.bluewallet.io', ssl: '443' },
    { host: 'electrum1.bluewallet.io', tcp: '50001' },
    { host: 'electrum2.bluewallet.io', tcp: '50001' },
    { host: 'electrum3.bluewallet.io', tcp: '50001' },
];

const gap_limit = 20;
const index = 1000;

describe('ElectrumClient', () => {
    it('can connect and query', async () => {
        //const ecl = new ElectrumCli(443, 'electrum2.bluewallet.io', 'tls') // tcp or tls
        //await ecl.connect() // connect(promise)
        const peer = { host: 'testnet.hsmiths.com', ssl: '53012' };
        const mainClient = new ElectrumClient(global.net, global.tls, peer.ssl || peer.tcp, peer.host, peer.ssl ? 'tls' : 'tcp');
        //mainClient.close()
        try {
            //await mainClient.connect();
            //console.log(connected)
            const ver = await mainClient.initElectrum({ client: 'bluewallet', version: '1.4' });
            console.log(`ver : ${ver}`)
        } catch (e) {
            mainClient.reconnect = mainClient.keepAlive = () => { }; // dirty hack to make it stop reconnecting
            mainClient.close();
            throw new Error('bad connection: ' + JSON.stringify(peer) + ' ' + e.message);
        }

        try {
            //const ver = await ecl.server_version("bluewallet", '1.4') // json-rpc(promise)


            // const zpub = ""
            // console.log(xpub)
            // let data = b58.decode(zpub);
            // data = data.slice(4);
            // data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data]);
            // const xpub = b58.encode(data);
            const xpub = "tpubDAenfwNu5GyCJWv8oqRAckdKMSUoZjgVF5p8WvQwHQeXjDhAHmGrPa4a4y2Fn7HF2nfCLefJanHV3ny1UY25MRVogizB2zRUdAo7Tr9XAjm";
            console.log(xpub)
            const hdNode = HDNode.fromBase58(xpub, bitcoin.networks.testnet);
            const node = hdNode.derive(0);
            console.log(node)
            //const node = HDNode.fromBase58(xpub);
            // const address = bitcoin.payments.p2pkh({
            //     pubkey: node.derive(0).derive(0).publicKey,
            // }).address;

            // console.log(address)

            console.log(gap_limit)
            const ret = {};
            const batchsize = 100;
            const gerenateChunkAddresses = chunkNum => {
                const ret = [];
                for (let c = gap_limit * chunkNum; c < gap_limit * (chunkNum + 1); c++) {
                    console.log(c)
                    const node0 = node.derive(c);
                    const address = bitcoin.payments.p2wpkh({
                        pubkey: node0.publicKey,
                        network: bitcoin.networks.testnet,
                    }).address;
                    ret.push(address);
                    //console.log("chunk: " + address)
                }
                return ret;
            };

            const splitIntoChunks = (arr, chunkSize) => {
                const groups = [];
                let i;
                for (i = 0; i < arr.length; i += chunkSize) {
                    groups.push(arr.slice(i, i + chunkSize));
                }
                return groups;
            };

            let lastChunkWithUsedAddressesNum = null;
            let lastHistoriesWithUsedAddresses = null;
            for (let c = 0; c < Math.round(index / gap_limit); c++) {
                //console.log("c is " + c);

                const chunks = splitIntoChunks(gerenateChunkAddresses(c), batchsize);

                // for (let i = 0; i < chunks.length; i++) {
                //     console.log(chunks[i])
                // }

                for (const chunk of chunks) {
                    const scripthashes = [];
                    const scripthash2addr = {};
                    if (chunk.length == 0)
                        continue;
                    for (const addr of chunk) {
                        const script = bitcoin.address.toOutputScript(addr, bitcoin.networks.testnet);
                        const hash = bitcoin.crypto.sha256(script);
                        let reversedHash = Buffer.from(reverse(hash));
                        reversedHash = reversedHash.toString('hex');
                        scripthashes.push(reversedHash);
                        scripthash2addr[reversedHash] = addr;
                        //console.log("script hash: " + reversedHash)
                    }

                    let results = [];
                    results = await mainClient.blockchainScripthash_getHistoryBatch(scripthashes);
                    //console.log(results);
                    for (const history of results) {
                        if (history.error) console.warn('multiGetHistoryByAddress():', history.error);
                        ret[scripthash2addr[history.param]] = history.result || [];
                        // for (const result of history.result || []) {
                        //     if (result.tx_hash) txhashHeightCache[result.tx_hash] = result.height; // cache tx height
                        // }

                        for (const hist of ret[scripthash2addr[history.param]]) {
                            hist.address = scripthash2addr[history.param];
                        }
                    }
                }

                //const histories = await BlueElectrum.multiGetHistoryByAddress(gerenateChunkAddresses(c));
                // if (ret.length > 0) {
                //     // in this particular chunk we have used addresses
                //     lastChunkWithUsedAddressesNum = c;
                //     lastHistoriesWithUsedAddresses = ret;
                // } else {
                //     // empty chunk. no sense searching more chunks
                //     break;
                // }
            }
            console.log(ret)

            // let addr4elect = 'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej';
            // let script = bitcoin.address.toOutputScript(addr4elect);
            // console.log(`script : ${script}`)

            // let hash = bitcoin.crypto.sha256(script);
            // console.log(`hash: ${hash}`)

            // let reversedHash = Buffer.from(hash.reverse());
            // console.log(`reversed hash: ${reversedHash}`)
            // console.log(`hex: ${reversedHash.toString('hex')}`)

            // const start = +new Date();
            // let balance = await ecl.blockchainScripthash_getBalance(reversedHash.toString('hex'));
            // console.log(`balance => Confirmed: ${balance.confirmed}, Unconfirmed ${balance.unconfirmed}`)

            // const end = +new Date();
            // end - start > 1000 && console.warn(peer.host, 'took', (end - start) / 1000, 'seconds to fetch balance');
            // assert.ok(balance.confirmed > 0);

            // let peers = await mainClient.serverPeers_subscribe();
        } catch (e) {
            console.log(e)
        }
        await mainClient.close() // disconnect(promise)
        console.log('closed');
        //done()
    });
});
