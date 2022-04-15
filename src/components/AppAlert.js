import React from 'react';
import { View, StyleSheet } from 'react-native';
import Dialog from "react-native-dialog";
import Colors from '../config/Colors';
import Localize from '../config/Localize';

function AppAlert({ title, message, actionButtonTitle, visible, onAction, onCancel, isAlert = false }) {

    return (
        <View style={styles.container}>
            <Dialog.Container
                contentStyle={styles.deleteContainer}
                blurComponentIOS={<View></View>}
                visible={visible}>
                <Dialog.Title style={styles.headerStyle}>{title}</Dialog.Title>
                <Dialog.Description style={styles.headerStyle}>
                    {message}
                </Dialog.Description>
                <Dialog.Button color={Colors.white} label={isAlert ? Localize.getLabel('ok') : Localize.getLabel('cancel')} onPress={onCancel} />
                {!isAlert &&
                    <Dialog.Button color={Colors.white} label={actionButtonTitle} onPress={onAction} />
                }
            </Dialog.Container>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    deleteContainer: {
        backgroundColor: Colors.cardBackground,
        borderColor: Colors.white,
        borderWidth: 0.3
    },
    headerStyle: {
        color: Colors.white,
    }
});

export default AppAlert;