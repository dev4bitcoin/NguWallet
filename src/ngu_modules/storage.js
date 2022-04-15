import AsyncStorage from '@react-native-async-storage/async-storage';

const storeItem = async (key, item) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(item));
    }
    catch (ex) {
        console.log('Error storing the item');
    }
}

const getItem = async (key) => {
    try {
        const item = await AsyncStorage.getItem(key);
        //console.log(item);
        if (item) {
            return JSON.parse(item);
        }
        return item;
    }
    catch (ex) {
        console.log('Error getting the item');
    }
}

const removeItem = async (key) => {
    try {
        await AsyncStorage.removeItem(key);

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