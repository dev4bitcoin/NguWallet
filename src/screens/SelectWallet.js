import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import AppButtonGroup from '../components/ButtonGroup';
import AppButton from '../components/Button';
import routes from '../navigation/routes';
import common from '../config/common';
import Popup from '../components/Popup';

const recoveryPhraseButtons = ['12', '24'];

function SelectWallet({ route, navigation }) {
    const defaultWalletType = common.getDefaultWallectType();
    const [selectedWalletType, setSelectedWalletType] = useState(defaultWalletType);
    const [walletName, setWalletName] = useState(Localize.getLabel('wallet1'));
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [walletTypeVisible, setWalletTypeVisible] = useState(false);
    const walletTypes = common.getWalletTypes();


    const handleRecoveryPhraseClick = (args) => {
        setSelectedIndex(args);
    }

    const getWalletInputInfo = () => {
        return {
            name: walletName,
            type: selectedWalletType.value,
            seedPhraseLength: selectedIndex == 0 ? 12 : 24
        }
    }

    const onWalletSelect = async (item) => {
        setSelectedWalletType(item);
        setWalletTypeVisible(false);
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <View style={styles.headerArea}>
                        <AppText style={styles.header}>{Localize.getLabel('singlesig')}</AppText>
                    </View>
                    <AppText style={styles.subHeader}>{Localize.getLabel('singlesigDescription')}</AppText>

                    <AppText style={styles.title}>{Localize.getLabel('name')}</AppText>
                    <TextInput
                        style={styles.input}
                        value={walletName}
                        onChangeText={(text) => setWalletName(text)}
                    />

                    <AppText style={styles.title}>{Localize.getLabel('walletType')}</AppText>
                    <TouchableOpacity onPress={() => setWalletTypeVisible(true)}>
                        <View style={styles.walletType}>
                            <AppText style={styles.walletText}>{selectedWalletType.title}</AppText>
                            <Icon
                                name="down"
                                size={20}
                                color={Colors.textGray}
                                style={styles.icon} />
                        </View>
                        <Popup
                            isModalVisible={walletTypeVisible}
                            titleHeader={Localize.getLabel('walletType')}
                            onPress={() => setWalletTypeVisible(false)}
                            items={walletTypes}
                            onSelect={onWalletSelect}
                            selected={selectedWalletType}
                        />
                    </TouchableOpacity>

                    <View style={styles.recoveryPhrase}>
                        <AppText style={styles.title}>{Localize.getLabel('recoveryPhraseLength')}</AppText>
                        <AppButtonGroup
                            onPress={handleRecoveryPhraseClick}
                            selectedIndex={selectedIndex}
                            setSelectedIndex={setSelectedIndex}
                            buttons={recoveryPhraseButtons} />
                    </View>
                </View>
                <View style={styles.continueButton}>
                    <AppButton
                        onPress={() => navigation.navigate(routes.SEED, getWalletInputInfo())}
                        title={Localize.getLabel('continue')}
                        leftIcon={false}
                        rightIcon={true}
                        disabled={walletName.length > 0 ? false : true}
                        name="chevron-right"
                        bgColor={Colors.cardBackground}
                        color={Colors.white} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {

    },
    content: {
        backgroundColor: Colors.appBackground,
        margin: 20,
    },
    headerArea: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    header: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 26,
        paddingLeft: 20

    },
    subHeader: {
        color: Colors.bottomRowText,
        paddingTop: 20
    },
    input: {
        height: 40,
        fontSize: 16,
        borderWidth: 1,
        marginTop: 10,
        borderColor: Colors.bottomRowText,
        borderRadius: 2,
        color: Colors.white,
        paddingLeft: 2
    },
    title: {
        color: Colors.textGray,
        paddingTop: 30,
    },
    walletText: {
        color: Colors.white,
        padding: 9,
        paddingLeft: 2
    },
    icon: {
        paddingTop: 10,
        paddingRight: 10
    },

    walletType: {
        flexDirection: 'row',
        marginTop: 10,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: Colors.textGray,
        justifyContent: 'space-between'
    },
    continueButton: {
        marginLeft: 20,
        marginRight: 20
    }
});

export default SelectWallet;