import React, { useState } from 'react';

import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Colors from '../config/Colors';

const CustomSwitch = ({
    navigation,
    selectionMode,
    option1,
    option2,
    onSelectSwitch,
}) => {
    const [getSelectionMode, setSelectionMode] = useState(selectionMode);

    const updatedSwitchData = option => {
        setSelectionMode(option);
        onSelectSwitch(option);
    };

    return (
        <View
            style={styles.container}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => updatedSwitchData(1)}
                style={[styles.option, { backgroundColor: getSelectionMode == 1 ? Colors.priceGreen : Colors.cardBackground }]}
            >
                <Text style={styles.text}>{option1}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                TouchableOpacity
                activeOpacity={1}
                onPress={() => updatedSwitchData(2)}
                style={[styles.option, { backgroundColor: getSelectionMode == 2 ? Colors.priceGreen : Colors.cardBackground }]}
            >
                <Text style={styles.text}>{option2}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.cardBackground,
        width: 70,
        height: 40,
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: Colors.textGray,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 2,
        alignItems: 'center',
    },
    option: {
        flex: 1,
        borderRadius: 5,
    },
    text: {
        fontSize: 16,
        padding: 7,
        color: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default CustomSwitch;