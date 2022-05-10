import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../../components/Text';

function ExplorerScreen(props) {
    return (
        <View style={styles.container}>
            <AppText>Explorer</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {}
});

export default ExplorerScreen;