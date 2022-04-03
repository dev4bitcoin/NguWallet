import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppButton from '../components/Button';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import Screen from '../components/Screen';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import { WatchOnly } from '../class/wallets/watch-only';
import routes from '../navigation/routes';
import AppModal from '../components/Modal';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function WalletSettings({ route, navigation }) {
    const { id, name, type, transactionCount, derivationPath, updateName } = route.params;
    const [text, onChangeText] = useState(name);
    const [isModalVisible, setModalVisible] = useState(false);

    const onDelete = async () => {
        const watchOnly = new WatchOnly();
        await watchOnly.deleteWallet(id);
        navigation.navigate(routes.HOME);
    }

    const onSave = async () => {
        ReactNativeHapticFeedback.trigger("impactLight", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false
        });
        const watchOnly = new WatchOnly();
        await watchOnly.saveWalletName(id, text);
        updateName(text);
        setModalVisible(true);
        await sleep(1000);
        setModalVisible(false);
    }

    return (
        <Screen>
            <View style={styles.container}>
                <AppText style={styles.header}>{Localize.getLabel('name')}</AppText>
                <View style={styles.nameContainer}>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeText}
                        value={text} />
                    <View style={styles.saveIcon}>
                        <TouchableOpacity onPress={onSave}>
                            <Icon name="content-save" color={Colors.gainsboro} size={40} />
                        </TouchableOpacity>
                    </View>
                </View>

                <AppText style={styles.header}>{Localize.getLabel('type')}</AppText>
                <AppText style={styles.value}>{type}</AppText>

                <AppText style={styles.header}>{Localize.getLabel('transactionsCount')}</AppText>
                <AppText style={styles.value}>{transactionCount}</AppText>

                <AppText style={styles.header}>{Localize.getLabel('derivationPath')}</AppText>
                <AppText style={styles.value}>{derivationPath}</AppText>

                <View style={styles.deleteButton}>
                    <AppButton
                        onPress={onDelete}
                        title="Delete"
                        color={Colors.danger} />
                </View>
                <AppModal
                    isModalVisible={isModalVisible}
                    content={Localize.getLabel('saved')} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        //flex: 1
        //backgroundColor: Colors.watchOnly,
    },
    header: {
        fontSize: 20,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 20,
        color: Colors.bottomRowText,
    },
    value: {
        fontSize: 18,
        paddingRight: 20,
        paddingLeft: 22,
        paddingTop: 15,
        color: Colors.white,
    },
    nameContainer: {
        flexDirection: 'row',
        width: '100%'
    },
    input: {
        height: 40,
        fontSize: 16,
        borderWidth: 1,
        marginTop: 20,
        marginLeft: 20,
        width: '75%',
        borderColor: Colors.bottomRowText,
        borderRadius: 2,
        color: Colors.gainsboro,
        paddingLeft: 2
    },
    saveIcon: {
        paddingTop: 20,
        paddingLeft: 10
    },
    deleteButton: {
        marginTop: 50,
        marginLeft: 40,
        marginRight: 40
    }
});

export default WalletSettings;