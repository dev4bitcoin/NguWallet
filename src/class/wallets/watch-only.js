const b58 = require('bs58check');
const HDNode = require('bip32');

import { HDLegacyP2PKHWallet } from './HDLegacyP2PKHWallet';
import { HDSegwitP2SHWallet } from './HDSegwitP2SHWallet';
import { HDSegwitBech32Wallet } from './HDSegwitBech32Wallet';
import appStorage from '../app-storage';
import walletHelper from './walletHelper';

const ElectrumClient = require('../../ngu_modules/electrumClient');

export class WatchOnly {
    static type = "watchOnly"
    static typeReadable = 'Watch-only';
    _hdWalletInstance = null;
    secret = "";
    id = "";
    networkType = ElectrumClient.getNetworkType();
    path = '';

    async init(id) {
        if (id) {
            this.id = id;
            const wallet = await appStorage.getWalletById(id);
            if (wallet) {
                this.secret = wallet.xPub;
            }
        }
        let hdWalletInstance;
        if (this.secret.startsWith('xpub')) {
            hdWalletInstance = new HDLegacyP2PKHWallet();
            this.path = HDLegacyP2PKHWallet.derivationPath;
        }
        else if (this.secret.startsWith('ypub')) {
            hdWalletInstance = new HDSegwitP2SHWallet();
            this.path = HDSegwitP2SHWallet.derivationPath;
        }
        else if (this.secret.startsWith('zpub') || this.secret.startsWith('tpub')) {
            hdWalletInstance = new HDSegwitBech32Wallet();
            this.path = HDSegwitBech32Wallet.derivationPath;
        }
        else return this;
        hdWalletInstance._xpub = this._xpub;
        hdWalletInstance.secret = this.secret;
        hdWalletInstance.id = this.id;
        hdWalletInstance._derivationPath = this.path;


        // if (this._hdWalletInstance) {
        //     // now, porting all properties from old object to new one
        //     for (const k of Object.keys(this._hdWalletInstance)) {
        //         hdWalletInstance[k] = this._hdWalletInstance[k];
        //     }

        //     // deleting properties that cant survive serialization/deserialization:
        //     delete hdWalletInstance._node1;
        //     delete hdWalletInstance._node0;
        // }
        this._hdWalletInstance = hdWalletInstance;
        return this;
    }

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

            if (pubkey.startsWith('tpub')) {
                xpub = pubkey;
            }

            const hdNode = walletHelper.fromBase58(xpub);
            hdNode.derive(0);
            this.secret = pubkey;
            this._xpub = xpub;
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

    async fetchBalance(id) {
        if (!this._hdWalletInstance) await this.init(id);
        return this._hdWalletInstance.fetchBalance(id);
    }

    async fetchTransactions(id) {
        if (!this._hdWalletInstance) await this.init(id);
        return this._hdWalletInstance.fetchTransactions(id);
    }

    async assignLocalVariablesIfWalletExists(id) {
        if (!this._hdWalletInstance) await this.init(id);
        return this._hdWalletInstance.assignLocalVariablesIfWalletExists(id);
    }

    async resetWallets() {
        return await appStorage.resetWallets();
    }

    async saveWalletToDisk(type, walletName, secret) {
        if (!this._hdWalletInstance) await this.init();
        return this._hdWalletInstance.saveWalletToDisk(type, walletName, secret);
    }

    getTransactions() {
        if (this._hdWalletInstance) return this._hdWalletInstance.getTransactions();
        return super.getTransactions();
    }

    getDerivationPath() {
        return this.path;
    }

    async saveWalletName(id, name) {
        return await appStorage.saveWalletName(id, name);
    }

    async deleteWallet(id) {
        return await appStorage.deleteWallet(id);
    }

    async isWalletExist(pubKey) {
        return await appStorage.isWalletExist(pubKey);
    }

    async getSumOfAllWalletBalance() {
        const wallets = await appStorage.getWallets();
        let balance = 0;
        if (wallets.length > 0) {
            wallets.forEach(wallet => {
                balance += wallet.balance;
            });
        }
        return balance;
    }

    async getAddressAsync(id) {
        if (!this._hdWalletInstance) await this.init(id);
        return this._hdWalletInstance.getAddressAsync(id);
    }

    async setSecret(secret) {
        if (!this._hdWalletInstance) await this.init();
        return this._hdWalletInstance.setSecret(secret);
    }

    setDerivationPath(path) {
        if (this._hdWalletInstance)
            return this._hdWalletInstance.setDerivationPath(path);
    }

}