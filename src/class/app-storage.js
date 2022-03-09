import Localize from "../config/Localize";
import storage from "../ngu_modules/storage";

export class AppStorage {
    WALLETS = "wallets";

    async addAndSaveWallet(key, balance, type) {
        let wallet = await this.getWallet(key);
        if (wallet) {
            return;
        }

        let wallets = await this.getWallets();
        const walletInfo = {
            xPub: key,
            name: Localize.getLabel('watchOnly'),
            id: wallets.length + 1,
            balance: balance,
            type: type,
            lastUsedIndex: 0,
            transactions: []
        }
        wallets.push(walletInfo);
        await storage.storeItem(this.WALLETS, wallets);
    }

    async getWallet(key) {
        const wallets = await this.getWallets()
        const wallet = wallets.find(w => w.xPub === key)
        return wallet;
    }

    async getWallets() {
        const wallets = await storage.getItem(this.WALLETS) || [];
        return wallets;
    }

    async resetWallets() {
        return await storage.removeItem(this.WALLETS);
    }
}