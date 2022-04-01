import storage from "../ngu_modules/storage";

const WALLETS = "wallets";

const getWalletById = async (id) => {
    const wallets = await storage.getItem(WALLETS) || [];
    const wallet = wallets.find(w => w.id === id);
    return wallet;
}

const addAndSaveWallet = async (wallet) => {
    const wallets = await storage.getItem(WALLETS) || [];
    wallets.push(wallet);
    await storage.storeItem(WALLETS, wallets);
}

const getWallet = async (key) => {
    const wallets = await storage.getItem(WALLETS) || [];
    const wallet = wallets.find(w => w.xPub === key)
    return wallet;
}

const resetWallets = async () => {
    return await storage.removeItem(WALLETS);
}

const saveWalletTransactions = async (id, externalTransactions, internalTransactions) => {
    let wallets = await storage.getItem(WALLETS) || [];
    wallets.map(w => {
        if (w.id === id) {
            w.txsByInternalIndex = JSON.stringify(externalTransactions);
            w.txsByExternalIndex = JSON.stringify(internalTransactions);
        }
    });
    await storage.storeItem(WALLETS, wallets);
}


const updateWallet = async (id, balancesByExternalIndex, balancesByInternalIndex,
    nextFreeAddressIndex, nextFreeChangeAddressIndex, balance) => {
    let wallets = await storage.getItem(WALLETS) || [];
    wallets.map(w => {
        if (w.id === id) {
            w.nextFreeAddressIndex = nextFreeAddressIndex;
            w.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex;
            w.balancesByExternalIndex = JSON.stringify(balancesByExternalIndex);
            w.balancesByInternalIndex = JSON.stringify(balancesByInternalIndex);
            w.balance = balance;
        }
    });
    await storage.storeItem(WALLETS, wallets);
}

const getWallets = async () => {
    const wallets = await storage.getItem(WALLETS) || [];
    return wallets;
}

const saveWalletName = async (id, name) => {
    let wallets = await storage.getItem(WALLETS) || [];
    wallets.map(w => {
        if (w.id === id) {
            w.name = name;
        }
    });
    await storage.storeItem(WALLETS, wallets);
}

const deleteWallet = async (id) => {
    let wallets = await storage.getItem(WALLETS) || [];
    const filteredWallets = wallets.filter(w => w.id !== id);
    await storage.storeItem(WALLETS, filteredWallets);
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
    deleteWallet
}