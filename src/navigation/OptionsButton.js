import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../config/Colors';

function OptionsButton({ onPress }) {
    return (

        <View style={styles.container}>
            <TouchableOpacity onPress={onPress}>
                <Icon name='dots-horizontal' color={Colors.white} size={35} />
            </TouchableOpacity>
        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row-reverse',
        marginLeft: 20,
    }
});

export default OptionsButton;