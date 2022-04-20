const b58 = require('bs58check');
const bitcoin = require('bitcoinjs-lib');
const HDNode = require('bip32');
import * as bip39 from 'bip39';
var crypto = require('crypto')
import coinSelect from 'coinselect';

import { ECPairFactory } from 'ecpair';
const ecc = require('tiny-secp256k1');
const ECPair = ECPairFactory(ecc);

var createHash = require('create-hash')
import BigNumber from 'bignumber.js';

import appStorage from '../app-storage';
import mnemonic from '../../ngu_modules/mnemonic';
import walletHelper from './walletHelper';
const ElectrumClient = require('../../ngu_modules/electrumClient');

export class AbstractHDWallet {
    static type = "abstract";
    static defaultRBFSequence = 2147483648; // 1 << 31, minimum for replaceable transactions as per BIP68
    nextFreeAddressIndex = 0;
    nextFreeChangeAddressIndex = 0;
    balancesByExternalIndex = {};
    balancesByInternalIndex = {};
    txsByExternalIndex = {};
    txsByInternalIndex = {};
    externalAddressesCache = {};
    internalAddressesCache = {};
    gap_limit = ElectrumClient.gap_limit;
    index = ElectrumClient.index;
    id = ''
    networkType = ElectrumClient.getNetworkType();
    _node0 = null;
    _node1 = null;
    _xpub = "";
    secret = "";
    passphrase = "";
    _derivationPath = "";
    addressToWifCache = {};
    _utxo = {};

    _getSeed() {
        const mnemonic = this.secret;
        const passphrase = this.passphrase;
        return bip39.mnemonicToSeedSync(mnemonic, passphrase);
    }

    generateSeed(seedPhraseLength) {
        let bits = 16;
        if (seedPhraseLength == 24) {
            bits = 32;
        }
        var randomBytes = crypto.randomBytes(bits) // 128 bits is enough
        var mnemonicSeed = bip39.entropyToMnemonic(randomBytes.toString('hex'), mnemonic.getWordList());

        //var seed = bip39.mnemonicToSeed(mnemonic);
        return mnemonicSeed;
    }

    getDerivationPath() {
        const path = this._derivationPath;
        return path;
    }

    setDerivationPath(path) {
        return this._derivationPath = path;
    }

    getSecret() {
        return this.secret;
    }

    setSecret(secret) {
        return this.secret = secret;
    }

    async saveWalletName(id, name) {
        return await appStorage.saveWalletName(id, name);
    }

    async deleteWallet(id) {
        return await appStorage.deleteWallet(id);
    }

    getXpub() {
        if (this._xpub) {
            return this._xpub; // cache hit
        }
        // first, getting xpub
        const seed = this._getSeed();
        const root = walletHelper.fromSeed(seed);

        const path = this.getDerivationPath();
        const child = root.derivePath(path).neutered();
        const xpub = child.toBase58();

        // bitcoinjs does not support zpub yet, so we just convert it from xpub
        if (!global.useTestnet) {
            let data = b58.decode(xpub);
            data = data.slice(4);
            data = Buffer.concat([Buffer.from('04b24746', 'hex'), data]);
            this._xpub = b58.encode(data);
        }
        else {
            this._xpub = xpub;
        }

        return this._xpub;
    }

    _getID() {
        return createHash('sha256').update(this.secret).digest().toString('hex');
    }

    static _nodeToLegacyAddress(hdNode) {
        return walletHelper.getLegacyAddress(hdNode.publicKey);
    }

    static _nodeToBech32SegwitAddress(hdNode) {
        return walletHelper.getBech32Address(hdNode.publicKey);
    }

    static _nodeToP2shSegwitAddress(hdNode) {
        return walletHelper.getP2SHAddress(hdNode.publicKey);
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
            const hdNode = walletHelper.fromBase58(this._xpub);
            this._node0 = hdNode.derive(0);
        }
        if (this._node1 === null) {
            const hdNode = walletHelper.fromBase58(this._xpub);
            this._node1 = hdNode.derive(1);
        }

        const nodeType = isInternal ? this._node1 : this._node0;
        const node = nodeType.derive(index);
        address = walletHelper.getBech32Address(node.publicKey);

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

    _getTransactionsFromHistories(histories) {
        const txs = [];
        for (const history of Object.values(histories)) {
            for (const tx of history) {
                txs.push(tx);
            }
        }
        return txs;
    }

    _generateChunkAddresses(chunkNum, isInternal) {
        const ret = [];
        for (let c = this.gap_limit * chunkNum; c < this.gap_limit * (chunkNum + 1); c++) {
            const address = this._getAddressByIndex(c, isInternal);
            ret.push(address);
        }
        return ret;
    };

    async _getLastUsedIndex(isInternal = false) {
        let lastChunkWithUsedAddressesNum = null;
        let lastHistoriesWithUsedAddresses = null;
        for (let c = 0; c < Math.round(this.index / this.gap_limit); c++) {
            const chunkAddresses = this._generateChunkAddresses(c, isInternal);
            const histories = await ElectrumClient.multiGetHistoryByAddress(chunkAddresses);
            if (this._getTransactionsFromHistories(histories).length > 0) {
                lastChunkWithUsedAddressesNum = c;
                lastHistoriesWithUsedAddresses = histories;
            }
            else {
                break;
            }
        }

        let lastUsedIndex = 0;

        if (lastHistoriesWithUsedAddresses) {
            // now searching for last used address in batch lastChunkWithUsedAddressesNum
            for (
                let c = lastChunkWithUsedAddressesNum * this.gap_limit;
                c < lastChunkWithUsedAddressesNum * this.gap_limit + this.gap_limit;
                c++
            ) {
                const address = this._getAddressByIndex(c, isInternal);
                if (lastHistoriesWithUsedAddresses[address] && lastHistoriesWithUsedAddresses[address].length > 0) {
                    lastUsedIndex = Math.max(c, lastUsedIndex) + 1; // point to next, which is supposed to be unused
                }
            }
        }

        return lastUsedIndex;
    }

    _convertToInternalFormatAndReturnBalance(balances) {
        let balance = 0;
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            const addr = this._getAddressByIndex(c);
            if (balances.addresses[addr]) {
                if (this.balancesByExternalIndex[c]) {
                    if (
                        this.balancesByExternalIndex[c].c !== balances.addresses[addr].confirmed ||
                        this.balancesByExternalIndex[c].u !== balances.addresses[addr].unconfirmed
                    ) {
                        this.balancesByExternalIndex[c].c = balances.addresses[addr].confirmed;
                        this.balancesByExternalIndex[c].u = balances.addresses[addr].unconfirmed;
                    }
                }
                this.balancesByExternalIndex[c] = {
                    c: balances.addresses[addr].confirmed,
                    u: balances.addresses[addr].unconfirmed,
                };

                balance += this.balancesByExternalIndex[c].c;
            }
        }

        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            const addr = this._getAddressByIndex(c, true);
            if (balances.addresses[addr]) {
                if (this.balancesByInternalIndex[c]) {
                    if (
                        this.balancesByInternalIndex[c].c !== balances.addresses[addr].confirmed ||
                        this.balancesByInternalIndex[c].u !== balances.addresses[addr].unconfirmed
                    ) {
                        this.balancesByInternalIndex[c].c = balances.addresses[addr].confirmed;
                        this.balancesByInternalIndex[c].u = balances.addresses[addr].unconfirmed;
                    }
                }
                this.balancesByInternalIndex[c] = {
                    c: balances.addresses[addr].confirmed,
                    u: balances.addresses[addr].unconfirmed,
                };
                balance += this.balancesByInternalIndex[c].c;
            }
        }

        return balance;
    }

    async _fetchBalance() {
        //probe future addresses in hierarchy in case any new transactions
        const lagAddressesToFetch = [];
        for (let c = this.nextFreeAddressIndex; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            lagAddressesToFetch.push(this._getAddressByIndex(c));
        }
        for (let c = this.nextFreeChangeAddressIndex; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            lagAddressesToFetch.push(this._getAddressByIndex(c, true));
        }

        const txs = await ElectrumClient.multiGetHistoryByAddress(lagAddressesToFetch);

        for (let c = this.nextFreeAddressIndex; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            const address = this._getAddressByIndex(c);
            if (txs[address] && Array.isArray(txs[address]) && txs[address].length > 0) {
                this.nextFreeAddressIndex = c + 1;
            }
        }

        for (let c = this.nextFreeChangeAddressIndex; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            const address = this._getAddressByIndex(c, true);
            if (txs[address] && Array.isArray(txs[address]) && txs[address].length > 0) {
                this.nextFreeChangeAddressIndex = c + 1;
            }
        }

        const addresses2fetch = [];

        // generating all involved addresses.
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            addresses2fetch.push(this._getAddressByIndex(c));
        }

        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            addresses2fetch.push(this._getAddressByIndex(c, true));
        }
        const balance = await ElectrumClient.multiGetBalanceByAddress(addresses2fetch);
        console.log(balance);
        return balance;
    }

    async _updateWalletData(id, balance) {
        await appStorage.updateWallet({
            id: id,
            balancesByExternalIndex: this.balancesByExternalIndex,
            balancesByInternalIndex: this.balancesByInternalIndex,
            nextFreeAddressIndex: this.nextFreeAddressIndex,
            nextFreeChangeAddressIndex: this.nextFreeChangeAddressIndex,
            externalAddressesCache: this.externalAddressesCache,
            internalAddressesCache: this.internalAddressesCache,
            addressToWifCache: this.addressToWifCache,
            balance: balance
        });
    }

    async fetchBalance(id) {
        const startTimer = +new Date();
        const wallet = await appStorage.getWalletById(id);

        if (wallet) {
            this.nextFreeAddressIndex = wallet.nextFreeAddressIndex;
            this.nextFreeChangeAddressIndex = wallet.nextFreeChangeAddressIndex;
        }

        // Fetch last used index for fresh wallet
        if (this.nextFreeAddressIndex === 0 && this.nextFreeChangeAddressIndex === 0) {
            const start = +new Date();

            this.nextFreeAddressIndex = await this._getLastUsedIndex();
            this.nextFreeChangeAddressIndex = await this._getLastUsedIndex(true);

            const end = +new Date();
            end - start > 1000 && console.warn('took', (end - start) / 1000, 'seconds to fetch last used index for internal and external');
        }

        const balances = await this._fetchBalance();
        const balance = this._convertToInternalFormatAndReturnBalance(balances);
        await this._updateWalletData(id, balance);

        const endTimer = +new Date();
        endTimer - startTimer > 1000 && console.warn('took', (endTimer - startTimer) / 1000, 'seconds to fetch balance');
        return balance;
    }

    _buildNewWalletDataToSave(type, walletName) {
        const walletInfo = {
            xPub: this.getXpub(),
            secret: this.secret,
            passphrase: this.passphrase,
            name: walletName,
            id: this.id,
            type: type,
            nextFreeAddressIndex: this.nextFreeAddressIndex,
            nextFreeChangeAddressIndex: this.nextFreeChangeAddressIndex,
            balancesByExternalIndex: JSON.stringify(this.balancesByExternalIndex),
            balancesByInternalIndex: JSON.stringify(this.balancesByInternalIndex),
            txsByExternalIndex: JSON.stringify(this.txsByExternalIndex),
            txsByInternalIndex: JSON.stringify(this.txsByInternalIndex),
            externalAddressesCache: JSON.stringify(this.externalAddressesCache),
            internalAddressesCache: JSON.stringify(this.internalAddressesCache),
            addressToWifCache: JSON.stringify(this.addressToWifCache),
            balance: 0,
            isTestnet: global.useTestnet,
            lastBalanceFetch: new Date()
        }

        return walletInfo;
    }

    async saveWalletToDisk(type, walletName, secret) {
        this.secret = secret;
        this.id = this._getID();
        const newWallet = this._buildNewWalletDataToSave(type, walletName);
        await appStorage.addAndSaveWallet(newWallet);

        const start = +new Date();
        await this.fetchBalance(this.id);
        const end = +new Date();
        end - start > 1000 && console.warn('took', (end - start) / 1000, 'seconds to fetch balance');
    }

    async fetchUtxo() {
        let addressess = [];

        // Confirmed balance
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            if (this.balancesByExternalIndex[c] && this.balancesByExternalIndex[c].c && this.balancesByExternalIndex[c].c > 0) {
                addressess.push(this._getAddressByIndex(c));
            }
        }
        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            if (this.balancesByInternalIndex[c] && this.balancesByInternalIndex[c].c && this.balancesByInternalIndex[c].c > 0) {
                addressess.push(this._getAddressByIndex(c, true));
            }
        }

        // Unconfirmed balance:
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            if (this.balancesByExternalIndex[c] && this.balancesByExternalIndex[c].u && this.balancesByExternalIndex[c].u > 0) {
                addressess.push(this._getAddressByIndex(c));
            }
        }
        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            if (this.balancesByInternalIndex[c] && this.balancesByInternalIndex[c].u && this.balancesByInternalIndex[c].u > 0) {
                addressess.push(this._getAddressByIndex(c, true));
            }
        }
        //console.log(addressess);
        const result = await ElectrumClient.multiGetUtxoByAddress(addressess);
        this._utxo = [];
        const mappedUtxo = walletHelper.mapUtxoAsArray(result);
        for (const arr of mappedUtxo) {
            this._utxo = this._utxo.concat(arr);
        }

        // backward compatibility TODO: remove when we make sure `.utxo` is not used
        this.utxo = this._utxo;
        // this belongs in `.getUtxo()`
        for (const u of this.utxo) {
            u.txid = u.txId;
            u.amount = u.value;
            u.wif = this._getWifForAddress(u.address);
            u.confirmations = u.height;
            //if (!u.confirmations && u.height) u.confirmations = BlueElectrum.estimateCurrentBlockheight() - u.height;
        }

        this.utxo = this.utxo.sort((a, b) => a.amount - b.amount);
        return result;
    }

    async assignLocalVariablesIfWalletExists(id) {
        if (!id) {
            return null;
        }
        const wallet = await appStorage.getWalletById(id);
        if (wallet) {
            this.secret = wallet.secret;
            this._xPub = wallet.xPub;
            this.nextFreeAddressIndex = wallet.nextFreeAddressIndex;
            this.nextFreeChangeAddressIndex = wallet.nextFreeChangeAddressIndex;
            this.balancesByExternalIndex = JSON.parse(wallet.balancesByExternalIndex);
            this.balancesByInternalIndex = JSON.parse(wallet.balancesByInternalIndex);
            this.txsByInternalIndex = JSON.parse(wallet.txsByInternalIndex);
            this.txsByExternalIndex = JSON.parse(wallet.txsByExternalIndex);
            this.externalAddressesCache = wallet.externalAddressesCache ? JSON.parse(wallet.externalAddressesCache) : {};
            this.internalAddressesCache = wallet.internalAddressesCache ? JSON.parse(wallet.internalAddressesCache) : {};
            this.addressToWifCache = wallet.addressToWifCache ? JSON.parse(wallet.addressToWifCache) : {};
        }

        return wallet;
    }

    async _fetchTransactions() {
        const addresses2fetch = [];

        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            // external addresses first
            let hasUnconfirmed = false;
            this.txsByExternalIndex[c] = this.txsByExternalIndex[c] || [];
            for (const tx of this.txsByExternalIndex[c]) {
                hasUnconfirmed = hasUnconfirmed || !tx.confirmations || tx.confirmations < 7;
            }

            if (hasUnconfirmed || this.txsByExternalIndex[c].length === 0 || this.balancesByExternalIndex[c].u !== 0) {
                addresses2fetch.push(this._getAddressByIndex(c));
            }
        }

        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            // next, internal addresses
            let hasUnconfirmed = false;
            this.txsByInternalIndex[c] = this.txsByInternalIndex[c] || [];
            for (const tx of this.txsByInternalIndex[c]) {
                hasUnconfirmed = hasUnconfirmed || !tx.confirmations || tx.confirmations < 7;
            }

            if (hasUnconfirmed || this.txsByInternalIndex[c].length === 0 || this.balancesByInternalIndex[c].u !== 0) {
                addresses2fetch.push(this._getAddressByIndex(c, true));
            }
        }

        // first: batch fetch for all addresses histories
        const histories = await ElectrumClient.multiGetHistoryByAddress(addresses2fetch);
        const txs = {};
        for (const history of Object.values(histories)) {
            for (const tx of history) {
                txs[tx.tx_hash] = tx;
            }
        }

        // next, batch fetching each txid we got
        const txdatas = await ElectrumClient.multiGetTransactionByTxid(Object.keys(txs));

        // now, tricky part. we collect all transactions from inputs (vin), and batch fetch them too.
        // then we combine all this data (we need inputs to see source addresses and amounts)
        const vinTxids = [];
        for (const txdata of Object.values(txdatas)) {
            for (const vin of txdata.vin) {
                vinTxids.push(vin.txid);
            }
        }
        const vintxdatas = await ElectrumClient.multiGetTransactionByTxid(vinTxids);

        // fetched all transactions from our inputs. now we need to combine it.
        // iterating all _our_ transactions:
        for (const txid of Object.keys(txdatas)) {
            // iterating all inputs our our single transaction:
            for (let inpNum = 0; inpNum < txdatas[txid].vin.length; inpNum++) {
                const inpTxid = txdatas[txid].vin[inpNum].txid;
                const inpVout = txdatas[txid].vin[inpNum].vout;
                // got txid and output number of _previous_ transaction we shoud look into
                if (vintxdatas[inpTxid] && vintxdatas[inpTxid].vout[inpVout]) {
                    // extracting amount & addresses from previous output and adding it to _our_ input:
                    txdatas[txid].vin[inpNum].addresses = vintxdatas[inpTxid].vout[inpVout].scriptPubKey.addresses;
                    txdatas[txid].vin[inpNum].value = vintxdatas[inpTxid].vout[inpVout].value;
                }
            }
        }

        // now purge all unconfirmed txs from internal hashmaps, since some may be evicted from mempool because they became invalid
        // or replaced. hashmaps are going to be re-populated anyways, since we fetched TXs for addresses with unconfirmed TXs
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            this.txsByExternalIndex[c] = this.txsByExternalIndex[c].filter(tx => !!tx.confirmations);
        }
        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            this.txsByInternalIndex[c] = this.txsByInternalIndex[c].filter(tx => !!tx.confirmations);
        }

        // now, we need to put transactions in all relevant `cells` of internal hashmaps: this.txsByInternalIndex && this.txsByExternalIndex
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            for (const tx of Object.values(txdatas)) {
                for (const vin of tx.vin) {
                    if (vin.addresses && vin.addresses.indexOf(this._getAddressByIndex(c)) !== -1) {
                        // this TX is related to our address
                        this.txsByExternalIndex[c] = this.txsByExternalIndex[c] || [];
                        const clonedTx = Object.assign({}, tx);
                        clonedTx.inputs = tx.vin.slice(0);
                        clonedTx.outputs = tx.vout.slice(0);
                        delete clonedTx.vin;
                        delete clonedTx.vout;

                        // trying to replace tx if it exists already (because it has lower confirmations, for example)
                        let replaced = false;
                        for (let cc = 0; cc < this.txsByExternalIndex[c].length; cc++) {
                            if (this.txsByExternalIndex[c][cc].txid === clonedTx.txid) {
                                replaced = true;
                                this.txsByExternalIndex[c][cc] = clonedTx;
                            }
                        }
                        if (!replaced) this.txsByExternalIndex[c].push(clonedTx);
                    }
                }
                for (const vout of tx.vout) {
                    if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses.indexOf(this._getAddressByIndex(c)) !== -1) {
                        // this TX is related to our address
                        this.txsByExternalIndex[c] = this.txsByExternalIndex[c] || [];
                        const clonedTx = Object.assign({}, tx);
                        clonedTx.inputs = tx.vin.slice(0);
                        clonedTx.outputs = tx.vout.slice(0);
                        delete clonedTx.vin;
                        delete clonedTx.vout;

                        // trying to replace tx if it exists already (because it has lower confirmations, for example)
                        let replaced = false;
                        for (let cc = 0; cc < this.txsByExternalIndex[c].length; cc++) {
                            if (this.txsByExternalIndex[c][cc].txid === clonedTx.txid) {
                                replaced = true;
                                this.txsByExternalIndex[c][cc] = clonedTx;
                            }
                        }
                        if (!replaced) this.txsByExternalIndex[c].push(clonedTx);
                    }
                }

            }
        }

        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            for (const tx of Object.values(txdatas)) {
                for (const vin of tx.vin) {
                    if (vin.addresses && vin.addresses.indexOf(this._getAddressByIndex(c, true)) !== -1) {
                        // this TX is related to our address
                        this.txsByInternalIndex[c] = this.txsByInternalIndex[c] || [];
                        const clonedTx = Object.assign({}, tx);
                        clonedTx.inputs = tx.vin.slice(0);
                        clonedTx.outputs = tx.vout.slice(0);
                        delete clonedTx.vin;
                        delete clonedTx.vout;

                        // trying to replace tx if it exists already (because it has lower confirmations, for example)
                        let replaced = false;
                        for (let cc = 0; cc < this.txsByInternalIndex[c].length; cc++) {
                            if (this.txsByInternalIndex[c][cc].txid === clonedTx.txid) {
                                replaced = true;
                                this.txsByInternalIndex[c][cc] = clonedTx;
                            }
                        }
                        if (!replaced) this.txsByInternalIndex[c].push(clonedTx);
                    }
                }
                for (const vout of tx.vout) {
                    if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses.indexOf(this._getAddressByIndex(c, true)) !== -1) {
                        // this TX is related to our address
                        this.txsByInternalIndex[c] = this.txsByInternalIndex[c] || [];
                        const clonedTx = Object.assign({}, tx);
                        clonedTx.inputs = tx.vin.slice(0);
                        clonedTx.outputs = tx.vout.slice(0);
                        delete clonedTx.vin;
                        delete clonedTx.vout;

                        // trying to replace tx if it exists already (because it has lower confirmations, for example)
                        let replaced = false;
                        for (let cc = 0; cc < this.txsByInternalIndex[c].length; cc++) {
                            if (this.txsByInternalIndex[c][cc].txid === clonedTx.txid) {
                                replaced = true;
                                this.txsByInternalIndex[c][cc] = clonedTx;
                            }
                        }
                        if (!replaced) this.txsByInternalIndex[c].push(clonedTx);
                    }
                }
            }
        }
    }

    async _saveTransactionsToWallet(id) {
        await appStorage.saveWalletTransactions(
            id,
            this.txsByExternalIndex,
            this.txsByInternalIndex,
            this.externalAddressesCache,
            this.internalAddressesCache)
    }

    async fetchTransactions(id) {
        //await this._setLocalVariablesIfWalletExists(id);
        const start = +new Date();
        await this._fetchTransactions();
        const end = +new Date();
        end - start > 1000 && console.warn('took', (end - start) / 1000, 'seconds to fetch transactions');
        await this._saveTransactionsToWallet(id);
    }

    getTransactions() {
        let txs = [];
        const start = +new Date();
        for (const addressTxs of Object.values(this.txsByExternalIndex)) {
            txs = txs.concat(addressTxs);
        }
        for (const addressTxs of Object.values(this.txsByInternalIndex)) {
            txs = txs.concat(addressTxs);
        }

        if (txs.length === 0) return [];

        const ownedAddresses = {};
        for (let c = 0; c < this.nextFreeAddressIndex + 1; c++) {
            ownedAddresses[this._getAddressByIndex(c)] = true;
        }
        for (let c = 0; c < this.nextFreeChangeAddressIndex + 1; c++) {
            ownedAddresses[this._getAddressByIndex(c, true)] = true;
        }

        const ret = [];
        for (const tx of txs) {
            tx.received = tx.blocktime * 1000;
            if (!tx.blocktime) tx.received = +new Date() - 30 * 1000; // unconfirmed
            tx.confirmations = tx.confirmations || 0; // unconfirmed
            tx.hash = tx.txid;
            tx.value = 0;

            for (const vin of tx.inputs) {
                // if input (spending) goes from our address - we are loosing!
                if (
                    (vin.address && ownedAddresses[vin.address]) ||
                    (vin.addresses && vin.addresses[0] && ownedAddresses[vin.addresses[0]])
                ) {
                    tx.value -= new BigNumber(vin.value).multipliedBy(100000000).toNumber();
                }
            }

            for (const vout of tx.outputs) {
                // when output goes to our address - this means we are gaining!
                if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses[0] && ownedAddresses[vout.scriptPubKey.addresses[0]]) {
                    tx.value += new BigNumber(vout.value).multipliedBy(100000000).toNumber();
                }
            }
            ret.push(tx);
        }

        // remove duplicates
        const usedTxIds = {};
        const ret2 = [];
        for (const tx of ret) {
            if (!usedTxIds[tx.txid]) ret2.push(tx);
            usedTxIds[tx.txid] = 1;
        }

        const sortedList = ret2.sort(function (a, b) {
            return b.received - a.received;
        });
        const end = +new Date();
        console.log('took', (end - start) / 1000, 'seconds to get transactions');
        return sortedList;
    }

    async resetWallets() {
        await appStorage.resetWallets();
    }

    async getAddressAsync() {
        // looking for free external address
        let freeAddress = '';
        let c;
        for (c = 0; c < this.gap_limit + 1; c++) {
            if (this.nextFreeAddressIndex + c < 0) continue;
            const address = this._getAddressByIndex(this.nextFreeAddressIndex + c);
            this.externalAddressesCache[this.nextFreeAddressIndex + c] = address; // updating cache just for any case
            let txs = [];
            try {
                txs = await ElectrumClient.getTransactionsByAddress(address);
            } catch (Err) {
                console.warn('ElectrumClient.getTransactionsByAddress()', Err.message);
            }
            if (txs.length === 0) {
                // found free address
                freeAddress = address;
                this.nextFreeAddressIndex += c; // now points to _this one_
                break;
            }
        }

        if (!freeAddress) {
            // could not find in cycle above, give up
            freeAddress = this._getAddressByIndex(this.nextFreeAddressIndex + c); // we didnt check this one, maybe its free
            this.nextFreeAddressIndex += c; // now points to this one
        }
        return freeAddress;
    }

    async getChangeAddressAsync() {
        // looking for free internal address
        let freeAddress = '';
        let c;
        for (c = 0; c < this.gap_limit + 1; c++) {
            if (this.nextFreeChangeAddressIndex + c < 0) continue;
            const address = this._getAddressByIndex(this.nextFreeChangeAddressIndex + c, true);
            this.internalAddressesCache[this.nextFreeChangeAddressIndex + c] = address; // updating cache just for any case
            let txs = [];
            try {
                txs = await ElectrumClient.getTransactionsByAddress(address);
            } catch (Err) {
                console.warn('ElectrumClient.getTransactionsByAddress()', Err.message);
            }
            if (txs.length === 0) {
                // found free address
                freeAddress = address;
                this.nextFreeChangeAddressIndex += c; // now points to _this one_
                break;
            }
        }

        if (!freeAddress) {
            // could not find in cycle above, give up
            freeAddress = this._getAddressByIndex(this.nextFreeChangeAddressIndex + c, true); // we didnt check this one, maybe its free
            this.nextFreeChangeAddressIndex += c; // now points to this one
        }
        return freeAddress;
    }

    getUtxo(respectFrozen = false) {
        let ret = [];

        if (this._utxo.length === 0) {
            ret = this.getDerivedUtxoFromOurTransaction(); // oy vey, no stored utxo. lets attempt to derive it from stored transactions
        } else {
            ret = this._utxo;
        }

        return ret;
    }

    getDerivedUtxoFromOurTransaction(returnSpentUtxoAsWell = false) {
        const utxos = [];

        // its faster to pre-build hashmap of owned addresses than to query `this.weOwnAddress()`, which in turn
        // iterates over all addresses in hierarchy
        const ownedAddressesHashmap = {};
        for (let c = 0; c < this.nextFreeAddressIndex + 1; c++) {
            ownedAddressesHashmap[this._getAddressByIndex(c)] = true;
        }
        for (let c = 0; c < this.nextFreeChangeAddressIndex + 1; c++) {
            ownedAddressesHashmap[this._getAddressByIndex(c, true)] = true;
        }

        for (const tx of this.getTransactions()) {
            for (const output of tx.outputs) {
                let address = false;
                if (output.scriptPubKey && output.scriptPubKey.addresses && output.scriptPubKey.addresses[0]) {
                    address = output.scriptPubKey.addresses[0];
                }
                if (ownedAddressesHashmap[address]) {
                    const value = new BigNumber(output.value).multipliedBy(100000000).toNumber();
                    utxos.push({
                        txid: tx.txid,
                        txId: tx.txid,
                        vout: output.n,
                        address,
                        value,
                        amount: value,
                        confirmations: tx.confirmations,
                        wif: false,
                        height: tx.height,
                    });
                }
            }
        }

        if (returnSpentUtxoAsWell) return utxos;

        // got all utxos we ever had. lets filter out the ones that are spent:
        const ret = [];
        for (const utxo of utxos) {
            let spent = false;
            for (const tx of this.getTransactions()) {
                for (const input of tx.inputs) {
                    if (input.txid === utxo.txid && input.vout === utxo.vout) spent = true;
                    // utxo we got previously was actually spent right here ^^
                }
            }

            if (!spent) {
                // filling WIFs only for legit unspent UTXO, as it is a slow operation
                utxo.wif = this._getWifForAddress(utxo.address);
                ret.push(utxo);
            }
        }

        return ret;
    }

    _getExternalWIFByIndex(index) {
        return this._getWIFByIndex(false, index);
    }

    _getInternalWIFByIndex(index) {
        return this._getWIFByIndex(true, index);
    }

    _getWIFByIndex(internal, index) {
        if (!this.secret) return false;
        const seed = this._getSeed();
        const root = walletHelper.fromSeed(seed);
        const path = `${this._derivationPath}/${internal ? 1 : 0}/${index}`;
        const child = root.derivePath(path);

        return child.toWIF();
    }

    _getWifForAddress(address) {
        if (this.addressToWifCache[address]) return this.addressToWifCache[address]; // cache hit

        // fast approach, first lets iterate over all addressess we have in cache
        for (const indexStr of Object.keys(this.internalAddressesCache)) {
            const index = parseInt(indexStr);
            if (this._getAddressByIndex(index, true) === address) {
                return (this.addressToWifCache[address] = this._getInternalWIFByIndex(index));
            }
        }

        for (const indexStr of Object.keys(this.externalAddressesCache)) {
            const index = parseInt(indexStr);
            if (this._getAddressByIndex(index) === address) {
                return (this.addressToWifCache[address] = this._getExternalWIFByIndex(index));
            }
        }

        // no luck - lets iterate over all addresses we have up to first unused address index
        for (let c = 0; c <= this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            const possibleAddress = this._getAddressByIndex(c, true);
            if (possibleAddress === address) {
                return (this.addressToWifCache[address] = this._getInternalWIFByIndex(c));
            }
        }

        for (let c = 0; c <= this.nextFreeAddressIndex + this.gap_limit; c++) {
            const possibleAddress = this._getAddressByIndex(c);
            if (possibleAddress === address) {
                return (this.addressToWifCache[address] = this._getExternalWIFByIndex(c));
            }
        }

        throw new Error('Could not find WIF for ' + address);
    }

    _getDerivationPathByAddress(address) {
        const path = this._derivationPath;
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            if (this._getAddressByIndex(c) === address) return path + '/0/' + c;
        }
        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            if (this._getAddressByIndex(c, true) === address) return path + '/1/' + c;
        }

        return false;
    }

    /**
     *
     * @param address {string} Address that belongs to this wallet
     * @returns {Buffer|boolean} Either buffer with pubkey or false
     */
    _getPubkeyByAddress(address) {
        for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
            if (this._getAddressByIndex(c) === address) return this._getNodePubkeyByIndex(0, c);
        }
        for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
            if (this._getAddressByIndex(c, true) === address) return this._getNodePubkeyByIndex(1, c);
        }

        return false;
    }

    /**
       *
       * @param utxos {Array.<{vout: Number, value: Number, txId: String, address: String}>} List of spendable utxos
       * @param targets {Array.<{value: Number, address: String}>} Where coins are going. If theres only 1 target and that target has no value - this will send MAX to that address (respecting fee rate)
       * @param feeRate {Number} satoshi per byte
       * @param changeAddress {String} Excessive coins will go back to that address
       * @param sequence {Number} Used in RBF
       * @param skipSigning {boolean} Whether we should skip signing, use returned `psbt` in that case
       * @param masterFingerprint {number} Decimal number of wallet's master fingerprint
       * @returns {{outputs: Array, tx: Transaction, inputs: Array, fee: Number, psbt: Psbt}}
       */
    createTransaction(utxos, targets, feeRate, changeAddress, sequence, skipSigning = false, masterFingerprint) {
        if (targets.length === 0) throw new Error('No destination provided');
        // compensating for coinselect inability to deal with segwit inputs, and overriding script length for proper vbytes calculation
        for (const u of utxos) {
            // this is a hacky way to distinguish native/wrapped segwit, but its good enough for our case since we have only
            // those 2 wallet types
            if (this._getAddressByIndex(0).startsWith('bc1')) {
                u.script = { length: 27 };
            } else if (this._getAddressByIndex(0).startsWith('3')) {
                u.script = { length: 50 };
            }
        }
        const { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate);

        sequence = sequence || AbstractHDWallet.defaultRBFSequence;
        let psbt = global.useTestnet ? new bitcoin.Psbt({ network: bitcoin.networks.testnet }) : new bitcoin.Psbt();
        let c = 0;
        const keypairs = {};
        const values = {};

        inputs.forEach(input => {
            let keyPair;
            if (!skipSigning) {
                // skiping signing related stuff
                const wif = this._getWifForAddress(input.address);
                keyPair = walletHelper.fromWIF(wif);
                keypairs[c] = keyPair;
            }
            values[c] = input.value;
            c++;
            if (!skipSigning) {
                // skiping signing related stuff
                if (!input.address || !this._getWifForAddress(input.address)) throw new Error('Internal error: no address or WIF to sign input');
            }

            let masterFingerprintBuffer;
            if (masterFingerprint) {
                let masterFingerprintHex = Number(masterFingerprint).toString(16);
                if (masterFingerprintHex.length < 8) masterFingerprintHex = '0' + masterFingerprintHex; // conversion without explicit zero might result in lost byte
                const hexBuffer = Buffer.from(masterFingerprintHex, 'hex');
                masterFingerprintBuffer = Buffer.from(reverse(hexBuffer));
            } else {
                masterFingerprintBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            }
            // this is not correct fingerprint, as we dont know real fingerprint - we got zpub with 84/0, but fingerpting
            // should be from root. basically, fingerprint should be provided from outside  by user when importing zpub

            psbt = this._addPsbtInput(psbt, input, sequence, masterFingerprintBuffer);
        });

        outputs.forEach(output => {
            // if output has no address - this is change output
            let change = false;
            if (!output.address) {
                change = true;
                output.address = changeAddress;
            }

            const path = this._getDerivationPathByAddress(output.address);
            const pubkey = this._getPubkeyByAddress(output.address);
            let masterFingerprintBuffer;

            if (masterFingerprint) {
                let masterFingerprintHex = Number(masterFingerprint).toString(16);
                if (masterFingerprintHex.length < 8) masterFingerprintHex = '0' + masterFingerprintHex; // conversion without explicit zero might result in lost byte
                const hexBuffer = Buffer.from(masterFingerprintHex, 'hex');
                masterFingerprintBuffer = Buffer.from(reverse(hexBuffer));
            } else {
                masterFingerprintBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            }

            // this is not correct fingerprint, as we dont know realfingerprint - we got zpub with 84/0, but fingerpting
            // should be from root. basically, fingerprint should be provided from outside  by user when importing zpub

            const outputData = {
                address: output.address,
                value: output.value,
            };

            if (change) {
                outputData.bip32Derivation = [
                    {
                        masterFingerprint: masterFingerprintBuffer,
                        path,
                        pubkey,
                    },
                ];
            }

            psbt.addOutput(outputData);
        });

        if (!skipSigning) {
            // skiping signing related stuff
            for (let cc = 0; cc < c; cc++) {
                psbt.signInput(cc, keypairs[cc]);
            }
        }

        let tx;
        if (!skipSigning) {
            tx = psbt.finalizeAllInputs().extractTransaction();
        }
        return { tx, inputs, outputs, fee, psbt };
    }

    _addPsbtInput(psbt, input, sequence, masterFingerprintBuffer) {
        const pubkey = this._getPubkeyByAddress(input.address);
        const path = this._getDerivationPathByAddress(input.address);
        let payment;
        if (global.useTestnet) {
            payment = {
                pubkey: pubkey,
                network: bitcoin.networks.testnet
            }
        }
        else {
            payment = {
                pubkey: pubkey,
            }
        }

        const p2wpkh = bitcoin.payments.p2wpkh(payment);

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
            witnessUtxo: {
                script: p2wpkh.output,
                value: input.value,
            },
        });

        return psbt;
    }

    async broadcast(hex) {
        return await ElectrumClient.broadcast(hex);
    }

    async checkIfServerOnline() {
        return await ElectrumClient.ping();
    }


}