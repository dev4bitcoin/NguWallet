import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

import Colors from '../config/Colors';
import AppText from './Text';
import Localize from '../config/Localize';

function TransactionButtons({ isWatchOnly, onSend, onReceive }) {
    return (
        <View style={styles.container}>
            <View style={styles.txButtons}>
                {!isWatchOnly &&
                    <>
                        <TouchableOpacity onPress={onSend}>
                            <View style={styles.sendButtonContainer}>
                                <Icon
                                    name="send"
                                    color={Colors.gold}
                                    size={25}
                                    style={styles.icon}
                                />
                                <AppText style={styles.text}>{Localize.getLabel('send')}</AppText>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.splitter}>

                        </View>
                    </>
                }
                <TouchableOpacity onPress={onReceive}>
                    <View style={styles.receiveButtonContainer}>
                        <AntDesignIcon
                            name="download"
                            color={Colors.gold}
                            size={27}
                            style={styles.icon}
                        />
                        <AppText style={styles.text}>{Localize.getLabel('receive')}</AppText>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.cardBackground,
        height: 50,
        paddingTop: 10,
        borderRadius: 5,
    },
    txButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    sendButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingRight: 30,
    },
    receiveButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    text: {
        color: Colors.white,
        paddingLeft: 10,
        fontSize: 20,
        fontWeight: '600'
    },
    splitter: {
        borderColor: Colors.white,
        borderWidth: 1,
        paddingTop: 2,
        marginRight: 30
    }
});

export default TransactionButtons;