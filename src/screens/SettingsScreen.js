import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import packageJson from '../../package.json'
import ListItem from '../components/ListItem';
import Screen from '../components/Screen';
import Colors from '../config/Colors';
import AppText from '../components/Text';
import { AppContext } from '../ngu_modules/appContext';
import routes from '../navigation/routes';
import Localize from '../config/Localize';

function SettingsScreen({ }) {
    const { preferredFiatCurrency } = useContext(AppContext);

    const navigation = useNavigation();

    return (
        <Screen style={styles.container}>
            <View style={styles.titleContainer}>
                <AppText style={[styles.header, styles.headerAlignment]}>{Localize.getLabel('settings')}</AppText>
                <View style={styles.closeButton}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.HOME)}>
                        <Icon
                            name="close"
                            size={25}
                            color={Colors.white}
                            style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <AppText style={styles.header}>{Localize.getLabel('general')}</AppText>
            <View style={styles.list}>
                <ListItem
                    title={Localize.getLabel('referenceExhangeRate')}
                    subTitle={preferredFiatCurrency.endPointKey}
                    onPress={() => navigation.navigate(routes.CURRECNCY_SELECTION, preferredFiatCurrency)}
                    showChevrons={true}
                />
            </View>

            <AppText style={styles.header}>{Localize.getLabel('about')}</AppText>
            <View style={styles.list}>
                <ListItem
                    title={Localize.getLabel('version')}
                    subTitle={`${Localize.getLabel('version')}: ${packageJson.version}`}
                    showChevrons={false}
                />
            </View>

        </Screen>

    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundDark
    },
    header: {
        color: Colors.white,
        fontWeight: 'bold',
        width: '90%',
        fontSize: 20,
        paddingLeft: 20,
    },
    headerAlignment: {
        textAlign: 'center',
        paddingLeft: 30,
        fontWeight: '600'
    },
    titleContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        paddingBottom: 30
    },
    closeButton: {
        flexDirection: 'row-reverse',
        marginLeft: 10
    },
    list: {
        padding: 15,
        paddingTop: 20
    },
});

export default SettingsScreen;