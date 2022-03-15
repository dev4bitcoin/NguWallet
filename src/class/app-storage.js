import storage from "../ngu_modules/storage";

export class AppStorage {
    WALLETS = "wallets";

    async addAndSaveWallet(wallet) {
        let wallets = await this.getWallets();
        wallets.push(wallet);
        await storage.storeItem(this.WALLETS, wallets);
    }

    async getWallet(key) {
        const wallets = await this.getWallets()
        const wallet = wallets.find(w => w.xPub === key)
        return wallet;
    }

    async getWalletById(id) {
        const wallets = await this.getWallets();
        const wallet = wallets.find(w => w.id === id)
        return wallet;
    }


    async getWallets() {
        const wallets = await storage.getItem(this.WALLETS) || [];
        return wallets;
    }

    async resetWallets() {
        return await storage.removeItem(this.WALLETS);
    }

    async saveWalletTransactions(id, externalTransactions, internalTransactions) {
        let wallets = await this.getWallets();
        wallets.map(w => {
            if (w.id === id) {
                w.txsByInternalIndex = JSON.stringify(externalTransactions);
                w.txsByExternalIndex = JSON.stringify(internalTransactions);
            }
        });
        await storage.storeItem(this.WALLETS, wallets);
    }

    async updateWallet(id, balancesByExternalIndex, balancesByInternalIndex, nextFreeAddressIndex, nextFreeChangeAddressIndex) {
        let wallets = await this.getWallets();
        wallets.map(w => {
            if (w.id === id) {
                w.nextFreeAddressIndex = nextFreeAddressIndex;
                w.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex;
                w.balancesByExternalIndex = JSON.stringify(balancesByExternalIndex);
                w.balancesByInternalIndex = JSON.stringify(balancesByInternalIndex);
            }
        });
        await storage.storeItem(this.WALLETS, wallets);
    }
}