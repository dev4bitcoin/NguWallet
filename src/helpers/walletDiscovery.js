import { Alert } from "react-native";

import { HDLegacyP2PKHWallet } from "../class/wallets/HDLegacyP2PKHWallet";
import { HDSegwitBech32Wallet } from "../class/wallets/HDSegwitBech32Wallet";
import { HDSegwitP2SHWallet } from "../class/wallets/HDSegwitP2SHWallet";
import walletType from "../class/wallets/walletType";
import { WatchOnly } from "../class/wallets/watch-only";

function getPath(type) {
    let path = '';
    if (type === walletType.HD_LEGACY_P2PKH) {
        path = HDLegacyP2PKHWallet.derivationPath;
    }
    else if (type === walletType.HD_SEGWIT_Bech32) {
        path = HDSegwitBech32Wallet.derivationPath;
    }
    else if (type === walletType.HD_SEGWIT_P2SH) {
        path = HDSegwitP2SHWallet.derivationPath;
    }

    return path;
};

async function getWalletInstance(wallet) {
    if (!wallet) {
        Alert.alert('Invalid wallet')
        return;
    }
    let walletClass;
    const { id, type } = wallet;
    const path = getPath(type);
    if (type === walletType.WATCH_ONLY) {
        walletClass = new WatchOnly();
    }
    else if (type === walletType.HD_LEGACY_P2PKH) {
        walletClass = new HDLegacyP2PKHWallet();
    }
    else if (type === walletType.HD_SEGWIT_Bech32) {
        walletClass = new HDSegwitBech32Wallet();
    }
    else if (type === walletType.HD_SEGWIT_P2SH) {
        walletClass = new HDSegwitP2SHWallet();
    }

    walletClass.setDerivationPath(path);
    await walletClass.assignLocalVariablesIfWalletExists(id);
    return walletClass;
}

export default {
    getWalletInstance
}