import { AbstractHDWallet } from "./AbstractHDWallet";
import walletHelper from "./walletHelper";
const HDNode = require('bip32');
const b58 = require('bs58check');
const bitcoin = require('bitcoinjs-lib');

export class HDSegwitBech32Wallet extends AbstractHDWallet {
    static type = 'HDSegwitBech32';
    static typeReadable = 'HD SegWit (BIP84 Bech32 Native)';
    static segwitType = 'p2wpkh';
    static derivationPath = "m/84'/0'/0'";

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

        // bitcoinjs does not support zpub yet, so we just convert it from xpub
        if (!global.useTestnet) {
            // let data = b58.decode(xpub);
            // data = data.slice(4);
            // data = Buffer.concat([Buffer.from('04b24746', 'hex'), data]);
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

        address = this.constructor._nodeToBech32SegwitAddress(node);

        if (!isInternal) {
            return this.externalAddressesCache[index] = address; // cache hit
        }
        else {
            return this.internalAddressesCache[index] = address; // cache hit
        }
    }

    _getNodePubkeyByIndex(node, index) {
        index = index * 1; // cast to int

        const xpub = this.getXpub();
        if (node === 0 && !this._node0) {
            const hdNode = walletHelper.fromBase58(xpub);
            this._node0 = hdNode.derive(node);
        }

        if (node === 1 && !this._node1) {
            const hdNode = walletHelper.fromBase58(xpub);
            this._node1 = hdNode.derive(node);
        }

        if (node === 0) {
            return this._node0.derive(index).publicKey;
        }

        if (node === 1) {
            return this._node1.derive(index).publicKey;
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
        return this.derivationPath;
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
        const utxos = await super.fetchUtxo();
        const mappedUtxos = walletHelper.mapUtxoAsArray(utxos);
        return mappedUtxos;
    }

    createTransaction(utxos, targets, feeRate, changeAddress, sequence, skipSigning = false, masterFingerprint) {
        return super.createTransaction(utxos, targets, feeRate, changeAddress, sequence, skipSigning, masterFingerprint);
    }

    async broadcast(hex) {
        return await super.broadcast(hex);
    }
}