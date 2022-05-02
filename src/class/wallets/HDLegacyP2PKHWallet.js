import { AbstractHDWallet } from "./AbstractHDWallet";
import walletHelper from "./walletHelper";
const ElectrumClient = require('../../ngu_modules/electrumClient');

export class HDLegacyP2PKHWallet extends AbstractHDWallet {
    static type = 'HDLegacyP2PKH';
    static typeReadable = 'HD Legacy (BIP44 P2PKH)';
    static derivationPath = "m/44'/0'/0'";

    getXpub() {
        if (this._xpub) {
            return this._xpub; // cache hit
        }
        const seed = this._getSeed();
        const root = walletHelper.fromSeed(seed);

        const path = this._derivationPath;
        const child = root.derivePath(path).neutered();
        this._xpub = child.toBase58();

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

        address = this.constructor._nodeToLegacyAddress(node);

        if (!isInternal) {
            return this.externalAddressesCache[index] = address; // cache hit
        }
        else {
            return this.internalAddressesCache[index] = address; // cache hit
        }
    }

    _getNodePubkeyByIndex(node, index) {
        index = index * 1; // cast to int

        if (node === 0 && !this._node0) {
            const xpub = this.getXpub();
            const hdNode = walletHelper.fromBase58(xpub);
            this._node0 = hdNode.derive(node);
        }

        if (node === 1 && !this._node1) {
            const xpub = this.getXpub();
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

    _addPsbtInput(psbt, input, sequence, masterFingerprintBuffer) {
        const pubkey = this._getPubkeyByAddress(input.address);
        const path = this._getDerivationPathByAddress(input.address);

        if (!input.txhex) throw new Error('UTXO is missing txhex of the input, which is required by PSBT for non-segwit input');

        psbt.addInput({
            hash: input.txId,
            index: input.vout,
            sequence,
            bip32Derivation: [
                {
                    masterFingerprint: masterFingerprintBuffer,
                    path,
                    pubkey,
                },
            ],
            // non-segwit inputs now require passing the whole previous tx as Buffer

            nonWitnessUtxo: Buffer.from(input.txhex, 'hex'),
        });

        return psbt;
    }

    async assignLocalVariablesIfWalletExists(id) {
        return super.assignLocalVariablesIfWalletExists(id);
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
        await super.fetchUtxo();

        // now we need to fetch txhash for each input as required by PSBT
        const txhexes = await ElectrumClient.multiGetTransactionByTxid(
            this.getUtxo().map(x => x.txid),
            50,
            false,
        );

        const newUtxos = [];
        for (const u of this.getUtxo()) {
            if (txhexes[u.txid]) u.txhex = txhexes[u.txid];
            newUtxos.push(u);
        }

        return newUtxos;
    }

    createTransaction(utxos, targets, feeRate, changeAddress, sequence, skipSigning = false, masterFingerprint) {
        return super.createTransaction(utxos, targets, feeRate, changeAddress, sequence, skipSigning, masterFingerprint);
    }

    async broadcast(hex) {
        return await super.broadcast(hex);
    }
}