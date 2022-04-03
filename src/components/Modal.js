import React from 'react';
import { View, StyleSheet } from 'react-native';
import Modal from "react-native-modal";

import Colors from '../config/Colors';
import AppText from './Text';

function AppModal({ isModalVisible, content }) {
    return (
        <View style={styles.container}>
            <Modal
                isVisible={isModalVisible}
                hideModalContentWhileAnimating={true}
                backdropTransitionOutTiming={0}
                style={styles.modal}
                backdropColor={Colors.backgroundDark}
            >
                <View style={styles.modalChildren}>
                    <AppText style={styles.modalText}>{content}</AppText>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalChildren: {
        backgroundColor: Colors.cardBackground,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 19,
        color: Colors.white,
        padding: 20,
    }
});

export default AppModal;