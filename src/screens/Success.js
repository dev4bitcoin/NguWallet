import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import ActivityIndicator from '../components/ActivityIndicator';

import AppButton from '../components/Button';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import walletDiscovery from '../helpers/walletDiscovery';
import routes from '../navigation/routes';

function Success({ route, navigation }) {
    const [loading, setLoading] = useState(false);
    const { name, type, seedPhrase } = route.params;

    const onClose = async () => {
        setLoading(true);
        const walletClass = await walletDiscovery.getWalletInstance({ id: null, type: type });
        await walletClass.saveWalletToDisk(type, name, seedPhrase);
        setLoading(false);
        navigation.navigate(routes.HOME);
    }

    return (
        <>
            <ActivityIndicator visible={loading} />

            <View style={styles.container}>

                <View style={styles.icon}>
                    <Icon
                        name="checkcircleo"
                        size={100}
                        color={Colors.priceGreen}
                        style={styles.icon} />
                </View>
                <AppText style={styles.title}>{Localize.getLabel('success')}</AppText>
                <View style={styles.closeButton}>
                    <AppButton
                        onPress={onClose}
                        title={Localize.getLabel('continue')}
                        leftIcon={false}
                        rightIcon={false}
                        name="chevron-right"
                        bgColor={Colors.cardBackground}
                        color={Colors.white} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 20,
        marginRight: 20,
        flex: 1,
        justifyContent: 'center',
    },
    icon: {
        alignSelf: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 28,
        color: Colors.white,
        textAlign: 'center',
        marginBottom: 20
    },
    closeButton: {
        marginTop: 20
    }
});

export default Success;