import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ButtonGroup } from 'react-native-elements'
import Colors from '../config/Colors';

function AppButtonGroup({ buttons, onPress, selectedIndex }) {

    return (
        <ButtonGroup
            buttons={buttons}
            selectedIndex={selectedIndex}
            onPress={onPress}
            containerStyle={styles.buttonGroupContainer}
            buttonStyle={styles.buttonGroupButtonStyle}
            textStyle={styles.buttonGroupButtonTextStyle}
            selectedTextStyle={styles.buttonGroupSelectedTextStyle}
            selectedButtonStyle={styles.buttonGroupSelectedButtonStyle}
            innerBorderStyle={styles.innerBorderStyle}
            buttonContainerStyle={styles.buttonContainerStyle}
        />
    );
}

const styles = StyleSheet.create({
    container: {},
    buttonGroupContainer: {
        marginBottom: 30,
        marginTop: 0,
        marginRight: 0,
        marginLeft: 0,
        borderWidth: 0,
        borderBottomWidth: 0.3,
        borderBottomColor: Colors.light
    },
    buttonGroupButtonStyle: {
        borderWidth: 0,
        backgroundColor: Colors.backgroundDark
    },
    buttonGroupButtonTextStyle: {
        color: '#6d767f',
        fontWeight: 'bold',
        fontSize: 17
    },
    buttonGroupSelectedTextStyle: {
        color: Colors.white,
    },
    buttonGroupSelectedButtonStyle: {
        backgroundColor: Colors.backgroundDark,
    },
    innerBorderStyle: {
        width: 0
    },
    buttonContainerStyle: {
        borderWidth: 0
    }

});

export default AppButtonGroup;