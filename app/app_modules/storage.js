import * as SecureStore from 'expo-secure-store'

const storeItem = async (key, item) => {
    try {
        await SecureStore.setItemAsync(key, JSON.stringify(item));
    }
    catch (ex) {
        console.log('Error storing the item');
    }
}

const getItem = async (key) => {
    try {
        const item = await SecureStore.getItemAsync(key);
        return JSON.parse(item);
    }
    catch (ex) {
        console.log('Error getting the item');
    }
}

const removeItem = async (key) => {
    try {
        await SecureStore.deleteItemAsync(key);

    }
    catch (ex) {
        console.log('Error removing the item');
    }
}

export default {
    removeItem,
    storeItem,
    getItem
}