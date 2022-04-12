import React from 'react';
import { StyleSheet } from 'react-native';
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
        marginTop: 20,
        marginRight: 0,
        marginLeft: 0,
        borderWidth: 0,
        borderBottomWidth: 0.3,
        borderBottomColor: Colors.light
    },
    buttonGroupButtonStyle: {
        borderWidth: 0,
        backgroundColor: Colors.appBackground
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
        backgroundColor: Colors.appBackground,
    },
    innerBorderStyle: {
        width: 0
    },
    buttonContainerStyle: {
        borderWidth: 0
    }
});

export default AppButtonGroup;