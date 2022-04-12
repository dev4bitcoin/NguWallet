import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '../config/Colors';

function ProgressBar({ percentage }) {
    return (
        <View style={styles.container}>
            <Animated.View style={[StyleSheet.absoluteFill], { backgroundColor: Colors.darkBlue, width: `${percentage}%` }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 20,
        marginTop: 20,
        flexDirection: "row",
        width: '100%',
        backgroundColor: Colors.cardBackground,
        borderColor: Colors.white,
        borderWidth: 0.3,
        borderRadius: 2
    },
});

export default ProgressBar;