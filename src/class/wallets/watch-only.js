import currency from '../../ngu_modules/currency';
import { AppStorage } from '../app-storage';
import walletType from './walletType';

const b58 = require('bs58check');
const bitcoin = require('bitcoinjs-lib');
const HDNode = require('bip32');


const ElectrumClient = require('../../ngu_modules/electrumClient');

export class WatchOnly {
    static type = "watchOnly"
    secret = "";
    _node0 = null;
    _node1 = null;

    isValid(pubkey) {
        let xpub;
        try {
            if (pubkey.startsWith('xpub')) {
                xpub = pubkey;
            }

            if (pubkey.startsWith('ypub')) {
                xpub = this._ypubToxPub(pubkey)
            }

            if (pubkey.startsWith('zpub')) {
                xpub = this._zpubToxPub(pubkey)
            }

            const hdNode = HDNode.fromBase58(xpub);
            hdNode.derive(0);
            this.secret = xpub;
            return true;
        }
        catch (ex) {
            return false;
        }
    }

    _ypubToxPub(ypub) {
        let data = b58.decode(ypub);
        if (data.readUInt32BE() !== 0x049d7cb2) throw new Error('Not a valid ypub extended key!');
        data = data.slice(4);
        data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data]);
        const xpub = b58.encode(data);
        return xpub;
    }

    _zpubToxPub(zpub) {
        let data = b58.decode(zpub);
        data = data.slice(4);
        data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data]);
        const xpub = b58.encode(data);
        return xpub;
    }

    _getAddressByIndex(index, isExternal) {
        let address = "";
        if (this._node0 === null) {
            const hdNode = HDNode.fromBase58(this.secret);
            this._node0 = hdNode.derive(0);
        }
        if (this._node1 === null) {
            const hdNode = HDNode.fromBase58(this.secret);
            this._node1 = hdNode.derive(1);
        }

        const nodeType = isExternal ? this._node0 : this._node1;
        const node = nodeType.derive(index);
        address = bitcoin.payments.p2wpkh({
            pubkey: node.publicKey,
        }).address;

        return address;
    }

    _generateChunkAddresses(chunkNum, isExternal) {
        const ret = [];
        for (let c = ElectrumClient.gap_limit * chunkNum; c < ElectrumClient.gap_limit * (chunkNum + 1); c++) {
            const address = this._getAddressByIndex(c, isExternal);
            ret.push(address);
        }
        return ret;
    };

    async _getAddressHistory(isExternal) {
        let allTransactionHistories = [];
        for (let c = 0; c < Math.round(ElectrumClient.index / ElectrumClient.gap_limit); c++) {
            const chunkAddresses = this._generateChunkAddresses(c, isExternal);
            const histories = await ElectrumClient.multiGetHistoryByAddress(chunkAddresses);

            for (const history of Object.values(histories)) {
                for (const tx of history) {
                    allTransactionHistories.push(tx.address);
                    break;
                }
            }
        }

        return allTransactionHistories;
    }

    async _getBothExternalAndInternalAddresses() {
        const start = +new Date();
        const externalAddresses = await this._getAddressHistory(true);

        const internalAddresses = await this._getAddressHistory(false);

        const combinedAddresses = externalAddresses.concat(internalAddresses);
        const end = +new Date();
        end - start > 1000 && console.warn('took', (end - start) / 1000, 'seconds to fetch address history');
        return combinedAddresses;
    }

    async fetchBalance(addresses) {
        const balance = await ElectrumClient.multiGetBalanceByAddress(addresses);
        return balance;
    }

    async saveWalletToDisk() {
        const addresses = await this._getBothExternalAndInternalAddresses();

        const start = +new Date();
        const balance = await this.fetchBalance(addresses);
        const end = +new Date();
        end - start > 1000 && console.warn('took', (end - start) / 1000, 'seconds to fetch balance');
        console.log('Confirmed: ' + balance.balance, 'Unconfirmed: ' + balance.unconfirmed_balance);

        const storage = new AppStorage();
        const btc = currency.satoshiToBTC(balance.balance);
        console.log(btc);
        await storage.addAndSaveWallet(this.secret, btc, walletType.WATCH_ONLY);
    }

    async fetchUtxo(addresses) {
        const balance = await ElectrumClient.multiGetUtxoByAddress(addresses);
        return balance;
    }

    async resetWallets() {
        const storage = new AppStorage();
        await storage.resetWallets();
    }
}