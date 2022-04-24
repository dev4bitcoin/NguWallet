import Constants from "../config/Constants";
import storage from "../ngu_modules/storage";

const WALLETS = global.useTestnet ? Constants.TESTNET_WALLETS : Constants.WALLETS;

const getWallets = async () => {
    const wallets = await storage.getItem(WALLETS) || [];
    return wallets;
}

const getWalletById = async (id) => {
    const wallets = await getWallets();
    const wallet = wallets.find(w => w.id === id);
    return wallet;
}

const addAndSaveWallet = async (wallet) => {
    const wallets = await getWallets();
    wallets.push(wallet);
    await storage.storeItem(WALLETS, wallets);
}

const getWallet = async (key) => {
    const wallets = await getWallets();
    const wallet = wallets.find(w => w.xPub === key)
    return wallet;
}

const resetWallets = async () => {
    return await storage.storeItem(WALLETS, []);
}

const saveWalletTransactions = async (id, externalTransactions, internalTransactions, externalAddressesCache, internalAddressesCache) => {
    let wallets = await getWallets();
    wallets.map(w => {
        if (w.id === id) {
            w.txsByInternalIndex = JSON.stringify(externalTransactions);
            w.txsByExternalIndex = JSON.stringify(internalTransactions);
            w.externalAddressesCache = JSON.stringify(externalAddressesCache);
            w.internalAddressesCache = JSON.stringify(internalAddressesCache);
        }
    });
    await storage.storeItem(WALLETS, wallets);
}

const updateWallet = async (wallet) => {
    let wallets = await getWallets();
    wallets.map(w => {
        if (w.id === wallet.id) {
            w.nextFreeAddressIndex = wallet.nextFreeAddressIndex;
            w.nextFreeChangeAddressIndex = wallet.nextFreeChangeAddressIndex;
            w.balancesByExternalIndex = JSON.stringify(wallet.balancesByExternalIndex);
            w.balancesByInternalIndex = JSON.stringify(wallet.balancesByInternalIndex);
            w.balance = wallet.balance;
            w.externalAddressesCache = JSON.stringify(wallet.externalAddressesCache);
            w.internalAddressesCache = JSON.stringify(wallet.internalAddressesCache);
            w.addressToWifCache = JSON.stringify(wallet.addressToWifCache);
        }
    });
    await storage.storeItem(WALLETS, wallets);
}

const saveWalletName = async (id, name) => {
    let wallets = await getWallets();
    wallets.map(w => {
        if (w.id === id) {
            w.name = name;
        }
    });
    await storage.storeItem(WALLETS, wallets);
}

const deleteWallet = async (id) => {
    let wallets = await getWallets();
    const filteredWallets = wallets.filter(w => w.id !== id);
    await storage.storeItem(WALLETS, filteredWallets);
}

const isWalletExist = async (pubKey) => {
    let wallets = await getWallets();
    const wallet = wallets.find(w => w.xPub === pubKey);

    if (wallet) {
        return true;
    }
    return false;
}

const storeDeviceToken = async (token) => {
    await storage.storeItem(Constants.DEVICE_TOKEN, token);
}

const getDeviceToken = async () => {
    return await storage.getItem(Constants.DEVICE_TOKEN);
}

export default {
    getWalletById,
    addAndSaveWallet,
    getWallet,
    resetWallets,
    saveWalletTransactions,
    updateWallet,
    getWallets,
    saveWalletName,
    deleteWallet,
    isWalletExist,
    storeDeviceToken,
    getDeviceToken
}