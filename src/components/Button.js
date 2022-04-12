import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from '../config/Colors';
import AppText from './Text';

function AppButton({ title, onPress, name, color = Colors.light, bgColor = Colors.backgroundDark, disabled = false, leftIcon = true, rightIcon = false }) {
    bgColor = disabled ? Colors.disabled : bgColor;
    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: bgColor }]} disabled={disabled} onPress={onPress}>
            <View style={styles.button} >
                {leftIcon &&
                    <Icon
                        name={name}
                        size={25}
                        color={disabled ? Colors.disabled : color}
                        style={styles.icon}
                    />
                }
                <AppText style={[styles.text, { color: color }]}>{title}</AppText>
                {rightIcon &&
                    <Icon
                        name={name}
                        size={25}
                        color={disabled ? Colors.disabled : color}
                        style={styles.icon}
                    />
                }
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
        marginBottom: 30,
        borderColor: Colors.white,
        borderWidth: 1,
        height: 50
    },
    icon: {
        paddingLeft: 10
    },
    text: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    }
});

export default AppButton;