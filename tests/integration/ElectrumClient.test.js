import * as bitcoin from 'bitcoinjs-lib';
import assert from 'assert';

import ElectrumCli from 'electrum-client'
//import '../../shim.js'
//jasmine.DEFAULT_TIMEOUT_INTERVAL = 150 * 1000;

const hardcodedPeers = [
    { host: 'electrum1.bluewallet.io', ssl: '443' },
    { host: 'electrum2.bluewallet.io', ssl: '443' },
    { host: 'electrum3.bluewallet.io', ssl: '443' },
    { host: 'electrum1.bluewallet.io', tcp: '50001' },
    { host: 'electrum2.bluewallet.io', tcp: '50001' },
    { host: 'electrum3.bluewallet.io', tcp: '50001' },
];


describe('ElectrumClient', () => {
    it('can connect and query', async () => {
        const ecl = new ElectrumCli(443, 'electrum2.bluewallet.io', 'tls') // tcp or tls
        await ecl.connect() // connect(promise)
        //console.log(ecl);
        console.log('connected')
        ecl.subscribe.on('blockchain.headers.subscribe', (v) => console.log(v)) // subscribe message(EventEmitter)

        try {
            const ver = await ecl.server_version("bluewallet", '1.4') // json-rpc(promise)
            console.log(`ver : ${ver}`)

            let addr4elect = 'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej';
            let script = bitcoin.address.toOutputScript(addr4elect);
            console.log(`script : ${script}`)

            let hash = bitcoin.crypto.sha256(script);
            console.log(`hash: ${hash}`)

            let reversedHash = Buffer.from(hash.reverse());
            console.log(`reversed hash: ${reversedHash}`)
            console.log(`hex: ${reversedHash.toString('hex')}`)

            const start = +new Date();
            let balance = await ecl.blockchainScripthash_getBalance(reversedHash.toString('hex'));
            console.log(`balance => Confirmed: ${balance.confirmed}, Unconfirmed ${balance.unconfirmed}`)

            const end = +new Date();
            end - start > 1000 && console.warn(peer.host, 'took', (end - start) / 1000, 'seconds to fetch balance');
            assert.ok(balance.confirmed > 0);

            // let peers = await mainClient.serverPeers_subscribe();
        } catch (e) {
            console.log(e)
        }
        await ecl.close() // disconnect(promise)
        console.log('closed');
    });
});
