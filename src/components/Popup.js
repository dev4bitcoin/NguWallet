import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Modal from "react-native-modal";

import Colors from '../config/Colors';
import Localize from '../config/Localize';
import AppText from './Text';

function Popup({ titleHeader, items, isModalVisible, onPress, selected, onSelect }) {
    const Item = ({ item, isSelected }) => (
        <TouchableOpacity onPress={() => onSelect(item)}>
            <View style={styles.item}>
                <AppText style={[styles.title, isSelected ? styles.selected : styles.notSelected]}>{item.title}</AppText>
            </View>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        const isSelected = (item.id === selected?.id);
        return <Item item={item} isSelected={isSelected} />;
    };

    return (
        <View style={styles.container}>
            <Modal
                isVisible={isModalVisible}
                hideModalContentWhileAnimating={true}
                backdropTransitionOutTiming={0}
                style={styles.modal}
                backdropColor={Colors.appBackground}
            >

                <View style={styles.modalChildren}>
                    <AppText style={styles.titleHeader}>{titleHeader}</AppText>
                    <FlatList
                        style={styles.list}
                        data={items}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={true}
                        renderItem={renderItem}
                    />


                </View>
                <TouchableOpacity onPress={onPress}>
                    <View style={styles.deleteButton}>
                        <AppText style={styles.buttonTitle}>{Localize.getLabel('close')}</AppText>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modal: {
        margin: 20,
        marginBottom: 2,
        justifyContent: 'flex-end',

    },
    modalChildren: {
        backgroundColor: Colors.appBackground,
        borderColor: Colors.textGray,
        borderWidth: 0.3,
        borderRadius: 10,
        justifyContent: 'center',
    },
    titleHeader: {
        fontSize: 21,
        color: Colors.medium,
        fontWeight: 'bold',
        paddingTop: 20,
        paddingBottom: 20,
        alignSelf: 'center'
    },
    item: {
        paddingTop: 20,
        paddingBottom: 20,
        borderTopWidth: 0.3,
        borderColor: Colors.textGray,
        alignItems: 'center'
    },
    title: {
        fontSize: 19,
        justifyContent: 'center',
        fontWeight: 'bold',
    },
    deleteButton: {
        marginTop: 2,
        backgroundColor: Colors.cardBackground,
        borderRadius: 10,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonTitle: {
        fontSize: 19,
        color: Colors.white,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
    selected: {
        color: Colors.orange,
    },
    notSelected: {
        color: Colors.white,
    }

});

export default Popup;