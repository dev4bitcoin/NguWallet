import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Modal from "react-native-modal";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppButton from '../components/Button';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';

function CustomFee({ customFeeModalVisible, setCustomFeeModalVisible, fee, setCustomFee, onPress }) {

    const onTextChange = (value) => {
        setCustomFee(value);
    }

    return (
        <View style={styles.container}>
            <Modal
                isVisible={customFeeModalVisible}
                hideModalContentWhileAnimating={true}
                backdropTransitionOutTiming={0}
                style={styles.modal}
                backdropColor={Colors.appBackground}
            >
                <View style={styles.modalChildren}>
                    <View style={styles.headerArea}>
                        <AppText style={styles.titleHeader}>{Localize.getLabel('custom')}</AppText>
                        <TouchableOpacity onPress={() => setCustomFeeModalVisible(false)}>
                            <MaterialIcon
                                name="close"
                                color={Colors.white}
                                size={22} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.textInputArea}>
                        <TextInput
                            placeholder='1.0'
                            placeholderTextColor={Colors.textGray}
                            style={styles.customTextInput}
                            keyboardType='numeric'
                            returnKeyType={'done'}
                            onChangeText={onTextChange}
                        >{fee}</TextInput>
                    </View>
                    <View style={styles.saveButton}>
                        <AppButton
                            onPress={onPress}
                            title={Localize.getLabel('save')}
                            //disabled={fee > 0 ? false : true}
                            bgColor={Colors.appBackground}
                            color={Colors.white} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    },
    modal: {
        marginBottom: 1,
        justifyContent: 'flex-end',
    },
    modalChildren: {
        padding: 20,
        backgroundColor: Colors.cardBackground,
        borderColor: Colors.textGray,
        borderWidth: 0.3,
        borderRadius: 10,
        justifyContent: 'center',
    },
    titleHeader: {
        textAlign: 'center',
        color: Colors.white,
        paddingBottom: 20,
        width: '92%',
        paddingLeft: 40
    },
    textInputArea: {
        borderWidth: 0.3,
        borderColor: Colors.white,
        marginTop: 10,
    },
    saveButton: {
        marginTop: 40,
    },
    customTextInput: {
        color: Colors.white,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 5
    },
    headerArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});

export default CustomFee;