const b58 = require('bs58check');
const bitcoin = require('bitcoinjs-lib');
const HDNode = require('bip32');
import * as bip39 from 'bip39';

var createHash = require('create-hash')
import BigNumber from 'bignumber.js';

import appStorage from '../app-storage';
import Localize from '../../config/Localize';
import walletType from './walletType';
const ElectrumClient = require('../../ngu_modules/electrumClient');

export class AbstractHDWallet {
    static type = "abstract";
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

    _getSeed() {
        const mnemonic = this.secret;
        const passphrase = this.passphrase;
        return bip39.mnemonicToSeedSync(mnemonic, passphrase);
    }

    getXpub() {
        if (this._xpub) {
            return this._xpub; // cache hit
        }
        // first, getting xpub
        const seed = this._getSeed();
        const root = HDNode.fromSeed(seed);

        const path = this.getDerivationPath();
        const child = root.derivePath(path).neutered();
        const xpub = child.toBase58();

        // bitcoinjs does not support zpub yet, so we just convert it from xpub
        let data = b58.decode(xpub);
        data = data.slice(4);
        data = Buffer.concat([Buffer.from('04b24746', 'hex'), data]);
        this._xpub = b58.encode(data);

        return this._xpub;
    }

    _getID() {
        return createHash('sha256').update(this.secret).digest().toString('hex');
    }

    static _nodeToLegacyAddress(hdNode) {
        return bitcoin.payments.p2pkh({
            pubkey: hdNode.publicKey,
            network: ElectrumClient.getNetworkType()
        }).address;
    }

    static _nodeToBech32SegwitAddress(hdNode) {
        return bitcoin.payments.p2wpkh({
            pubkey: hdNode.publicKey,
        }).address;
    }

    static _nodeToP2shSegwitAddress(hdNode) {
        const { address } = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({ pubkey: hdNode.publicKey }),
        });
        return address;
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
            const hdNode = HDNode.fromBase58(this.secret, ElectrumClient.getNetworkType());
            this._node0 = hdNode.derive(0);
        }
        if (this._node1 === null) {
            const hdNode = HDNode.fromBase58(this.secret, ElectrumClient.getNetworkType());
            this._node1 = hdNode.derive(1);
        }

        const nodeType = isInternal ? this._node1 : this._node0;
        const node = nodeType.derive(index);
        address = bitcoin.payments.p2wpkh({
            pubkey: node.publicKey,
            network: ElectrumClient.getNetworkType()
        }).address;

        if (!isInternal) {
            return this.externalAddressesCache[index] = address; // cache hit
        }
        else {
            return this.internalAddressesCache[index] = address; // cache hit
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
                balance += this.balancesByExternalIndex[c].c;
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
        console.log(balance.balance);
        return balance;
    }

    async _updateWalletData(balance) {
        await appStorage.updateWallet(
            this.id,
            this.balancesByExternalIndex,
            this.balancesByInternalIndex,
            this.nextFreeAddressIndex,
            this.nextFreeChangeAddressIndex,
            balance);
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
        await this._updateWalletData(balance);

        const endTimer = +new Date();
        endTimer - startTimer > 1000 && console.warn('took', (endTimer - startTimer) / 1000, 'seconds to fetch balance');
        return balance;
    }

    _buildNewWalletDataToSave() {
        const walletInfo = {
            xPub: this.secret,
            name: Localize.getLabel('watchOnly'),
            id: this.id,
            type: walletType.WATCH_ONLY,
            nextFreeAddressIndex: this.nextFreeAddressIndex,
            nextFreeChangeAddressIndex: this.nextFreeChangeAddressIndex,
            balancesByExternalIndex: JSON.stringify(this.balancesByExternalIndex),
            balancesByInternalIndex: JSON.stringify(this.balancesByInternalIndex),
            txsByExternalIndex: JSON.stringify(this.txsByExternalIndex),
            txsByInternalIndex: JSON.stringify(this.txsByInternalIndex),
            balance: 0,
            lastBalanceFetch: new Date()
        }

        return walletInfo;
    }

    async saveWalletToDisk() {
        this.id = this._getID();
        const newWallet = this._buildNewWalletDataToSave();
        await appStorage.addAndSaveWallet(newWallet);

        const start = +new Date();
        await this.fetchBalance();
        const end = +new Date();
        end - start > 1000 && console.warn('took', (end - start) / 1000, 'seconds to fetch balance');
    }

    // async _fetchUtxo() {
    //     let addressess = [];

    //     // Confirmed balance
    //     for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
    //         if (this.balancesByExternalIndex[c] && this.balancesByExternalIndex[c].c && this.balancesByExternalIndex[c].c > 0) {
    //             addressess.push(this._getAddressByIndex(c));
    //         }
    //     }
    //     for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
    //         if (this.balancesByInternalIndex[c] && this.balancesByInternalIndex[c].c && this.balancesByInternalIndex[c].c > 0) {
    //             addressess.push(this._getAddressByIndex(c, true));
    //         }
    //     }

    //     // Unconfirmed balance:
    //     for (let c = 0; c < this.nextFreeAddressIndex + this.gap_limit; c++) {
    //         if (this.balancesByExternalIndex[c] && this.balancesByExternalIndex[c].u && this.balancesByExternalIndex[c].u > 0) {
    //             addressess.push(this._getAddressByIndex(c));
    //         }
    //     }
    //     for (let c = 0; c < this.nextFreeChangeAddressIndex + this.gap_limit; c++) {
    //         if (this.balancesByInternalIndex[c] && this.balancesByInternalIndex[c].u && this.balancesByInternalIndex[c].u > 0) {
    //             addressess.push(this._getAddressByIndex(c, true));
    //         }
    //     }

    //     const result = await ElectrumClient.multiGetUtxoByAddress(addressess);
    //     console.log(result);
    //     return result;
    // }

    async assignLocalVariablesIfWalletExists(id) {
        const wallet = await appStorage.getWalletById(id);
        if (wallet) {
            this.secret = wallet.xPub
            this.nextFreeAddressIndex = wallet.nextFreeAddressIndex;
            this.nextFreeChangeAddressIndex = wallet.nextFreeChangeAddressIndex;
            this.balancesByExternalIndex = JSON.parse(wallet.balancesByExternalIndex);
            this.balancesByInternalIndex = JSON.parse(wallet.balancesByInternalIndex);
            this.txsByInternalIndex = JSON.parse(wallet.txsByInternalIndex);
            this.txsByExternalIndex = JSON.parse(wallet.txsByExternalIndex);
        }

        return wallet;
    }

    // async fetchUtxo(key) {
    //     const storage = new AppStorage();
    //     this._setLocalVariablesIfWalletExists(key, storage);
    //     await this._fetchUtxo();
    // }

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

    async _saveTransactionsToWallet() {
        await appStorage.saveWalletTransactions(this.id, this.txsByExternalIndex, this.txsByInternalIndex);
    }

    async fetchTransactions(id) {
        //await this._setLocalVariablesIfWalletExists(id);
        const start = +new Date();
        await this._fetchTransactions();
        const end = +new Date();
        end - start > 1000 && console.warn('took', (end - start) / 1000, 'seconds to fetch transactions');
        await this._saveTransactionsToWallet();
    }

    getTransactions() {
        let txs = [];

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

        return ret2.sort(function (a, b) {
            return b.received - a.received;
        });
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
        console.log(freeAddress);
        this._address = freeAddress;
        return freeAddress;
    }

}