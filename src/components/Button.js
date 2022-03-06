import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from '../config/Colors';
import AppText from './Text';

function AppButton({ title, onPress, name, color = Colors.light }) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.button} >
                <Icon
                    name={name}
                    size={25}
                    color={color}
                    style={styles.icon}
                />
                <AppText style={[styles.text, { color: color }]}>{title}</AppText>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        padding: 10,
    },
    container: {
        backgroundColor: Colors.backgroundDark,
        borderRadius: 5,
        //marginLeft: 10,
        //marginRight: 10,
        borderColor: Colors.white,
        borderWidth: 1,
        height: 50
    },
    icon: {
        paddingLeft: 10
    },
    text: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    }
});

export default AppButton;