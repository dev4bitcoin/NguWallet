import { AbstractHDWallet } from "./AbstractHDWallet";
const HDNode = require('bip32');

export class HDSegwitBech32Wallet extends AbstractHDWallet {
    static type = 'HDsegwitBech32';
    static typeReadable = 'HD SegWit (BIP84 Bech32 Native)';
    static segwitType = 'p2wpkh';
    static derivationPath = "m/84'/0'/0'";

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

        address = this.constructor._nodeToBech32SegwitAddress(node);

        if (!isInternal) {
            return this.externalAddressesCache[index] = address; // cache hit
        }
        else {
            return this.internalAddressesCache[index] = address; // cache hit
        }
    }
}