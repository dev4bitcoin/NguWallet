import { AbstractHDWallet } from "./AbstractHDWallet";
import walletHelper from "./walletHelper";
const b58 = require('bs58check');
const HDNode = require('bip32');

export class HDSegwitP2SHWallet extends AbstractHDWallet {
    static type = 'HDsegwitP2SH';
    static typeReadable = 'HD SegWit (BIP49 P2SH)';
    static segwitType = 'p2sh(p2wpkh)';
    static derivationPath = "m/49'/0'/0'";

    getXpub() {
        if (this._xpub) {
            return this._xpub; // cache hit
        }
        // first, getting xpub
        const seed = this._getSeed();
        const root = walletHelper.fromSeed(seed);

        const path = this._derivationPath;
        const child = root.derivePath(path).neutered();
        const xpub = child.toBase58();

        // bitcoinjs does not support ypub yet, so we just convert it from xpub
        if (!global.useTestnet) {
            // let data = b58.decode(xpub);
            // data = data.slice(4);
            // data = Buffer.concat([Buffer.from('049d7cb2', 'hex'), data]);
            // this._xpub = b58.encode(data);
            this._xpub = xpub;
        }
        else {
            this._xpub = xpub;
        }
        return this._xpub;
    }

    _getAddressByIndex(index, isInternal) {
        if (!isInternal) {
            if (this.externalAddressesCache[index])
                return this.externalAddressesCache[index]; // cache hit
        }
        else {
            if (this.internalAddressesCache[index])
                return this.internalAddressesCache[index]; // cache hit
        }

        let address = "";
        const xpub = this.getXpub();
        if (this._node0 === null) {
            const hdNode = walletHelper.fromBase58(xpub);
            this._node0 = hdNode.derive(0);
        }
        if (this._node1 === null) {
            const hdNode = walletHelper.fromBase58(xpub);
            this._node1 = hdNode.derive(1);
        }

        const nodeType = isInternal ? this._node1 : this._node0;
        const node = nodeType.derive(index);

        address = this.constructor._nodeToP2shSegwitAddress(node);

        if (!isInternal) {
            return this.externalAddressesCache[index] = address; // cache hit
        }
        else {
            return this.internalAddressesCache[index] = address; // cache hit
        }
    }

    async fetchBalance(id) {
        return await super.fetchBalance(id);
    }

    async fetchTransactions(id) {
        return await super.fetchTransactions(id);
    }

    getTransactions() {
        return super.getTransactions();
    }

    getDerivationPath() {
        return derivationPath;
    }

    async getAddressAsync(id) {
        return super.getAddressAsync(id);
    }

    async getChangeAddressAsync() {
        return super.getChangeAddressAsync();
    }

    generateSeed(seedPhraseLength) {
        return super.generateSeed(seedPhraseLength);
    }

    async saveWalletToDisk(type, walletName, secret) {
        return super.saveWalletToDisk(type, walletName, secret);
    }

    setDerivationPath(path) {
        return super.setDerivationPath(path);
    }

    setSecret(secret) {
        return super.secret = secret;
    }

    async saveWalletName(id, name) {
        return super.saveWalletName(id, name);
    }

    async deleteWallet(id) {
        return super.deleteWallet(id);
    }

    async fetchUtxo() {
        return super.fetchUtxo();
    }
}