import { AbstractHDWallet } from "./AbstractHDWallet";
const HDNode = require('bip32');

export class HDLegacyP2PKHWallet extends AbstractHDWallet {
    static type = 'HDlegacyP2PKH';
    static typeReadable = 'HD Legacy (BIP44 P2PKH)';
    static derivationPath = "m/44'/0'/0'";

    getXpub() {
        if (this._xpub) {
            return this._xpub; // cache hit
        }
        const seed = this._getSeed();
        const root = HDNode.fromSeed(seed);

        const path = derivationPath;
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

        if (this._node0 === null) {
            const hdNode = HDNode.fromBase58(this.secret, this.networkType);
            this._node0 = hdNode.derive(0);
        }
        if (this._node1 === null) {
            const hdNode = HDNode.fromBase58(this.secret, this.networkType);
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
}