import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from '../config/Colors';
import Localize from '../config/Localize';
import walletDiscovery from '../helpers/walletDiscovery';
import AppAlert from './AppAlert';
import AppActivityIndicator from './AppActivityIndicator';

function WalletDeleteAction({ wallet, onPress }) {
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const onDelete = () => {
        setShowAlert(true);
    }

    const handleDelete = async (item) => {
        setShowAlert(false);
        setLoading(true);
        const walletClass = await walletDiscovery.getWalletInstance({ id: wallet.id, type: wallet.type });
        await walletClass.deleteWallet(wallet.id);
        setLoading(false);
    }

    return (
        <>
            <AppActivityIndicator visible={loading} />
            <TouchableWithoutFeedback onPress={onDelete}>
                <View style={styles.container}>
                    <Icon name="trash-can" size={30} color={Colors.white} />
                </View>
            </TouchableWithoutFeedback>
            <AppAlert
                visible={showAlert}
                loading={loading}
                title={Localize.getLabel('delete')}
                message={Localize.getLabel('deletePrompt')}
                actionButtonTitle={Localize.getLabel('delete')}
                onAction={handleDelete}
                onCancel={() => setShowAlert(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.danger,
        width: 70,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default WalletDeleteAction;