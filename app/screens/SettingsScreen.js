import React, { useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import appJson from '../../app.json'

import ListItem from '../components/ListItem';
import Screen from '../components/Screen';
import Colors from '../config/Colors';
import AppText from '../components/Text';
import { AppContext } from '../app_modules/appContext';
import routes from '../navigation/routes';
import i18n from '../config/i18n';


const settings = [{
    id: 1,
    title: 'Reference Echange Rate'
},
]

function SettingsScreen({ }) {
    const { preferredFiatCurrency } = useContext(AppContext);

    const navigation = useNavigation();

    return (
        <Screen style={styles.container}>
            <View style={styles.titleContainer}>
                <AppText style={[styles.header, styles.headerAlignment]}>{i18n.t('settings')}</AppText>
                <View style={styles.closeButton}>
                    <TouchableOpacity onPress={() => navigation.navigate(routes.HOME)}>
                        <MaterialCommunityIcons
                            name="close"
                            size={25}
                            color={Colors.white}
                            style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <AppText style={styles.header}>{i18n.t('general')}</AppText>
            <View style={styles.list}>
                <ListItem
                    title={i18n.t('referenceExhangeRate')}
                    subTitle={preferredFiatCurrency.endPointKey}
                    onPress={() => navigation.navigate(routes.CURRECNCY_SELECTION, preferredFiatCurrency)}
                    showChevrons={true}
                />
            </View>

            <AppText style={styles.header}>{i18n.t('about')}</AppText>
            <View style={styles.list}>
                <ListItem
                    title={i18n.t('version')}
                    subTitle={`${i18n.t('version')}: ${appJson.expo.version}`}
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
        //paddingBottom: 20
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