import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DropDownPicker from 'react-native-dropdown-picker';

import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import AppButtonGroup from '../components/ButtonGroup';
import AppButton from '../components/Button';
import routes from '../navigation/routes';
import walletType from '../class/wallets/walletType';
import common from '../config/common';

const recoveryPhraseButtons = ['12', '24'];

function SelectWallet({ route, navigation }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(walletType.HD_SEGWIT_Bech32);
    const [items, setItems] = useState(common.getWalletTypes());
    const [walletName, setWalletName] = useState(Localize.getLabel('wallet1'));
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleRecoveryPhraseClick = (args) => {
        setSelectedIndex(args);
    }

    const getWalletInputInfo = () => {
        return {
            name: walletName,
            type: value,
            seedPhraseLength: selectedIndex == 0 ? 12 : 24
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <View style={styles.headerArea}>
                        <Icon
                            name="key"
                            size={35}
                            color={Colors.white}
                            style={styles.icon} />
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

                    <DropDownPicker
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        style={styles.picker}
                        theme="DARK"
                        placeholder={Localize.getLabel('selectWalletType')}
                        placeholderStyle={styles.pickerPlaceholder}
                        listItemContainerStyle={styles.listItemContainerStyle}
                        dropDownContainerStyle={styles.dropDownContainerStyle}
                    />

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
                        bgColor={Colors.darkBlue}
                        color={Colors.white} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        //backgroundColor: Colors.cardBackground,
        //margin: 20,
        //padding: 20,
    },
    content: {
        backgroundColor: Colors.cardBackground,
        margin: 20,
        padding: 20,
    },
    headerArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 20,
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
    picker: {
        backgroundColor: Colors.cardBackground,
        borderColor: Colors.bottomRowText,
        borderRadius: 2,
        marginTop: 10,

    },
    pickerPlaceholder: {
        color: Colors.textGray,
        fontWeight: "bold"
    },
    listItemContainerStyle: {
        backgroundColor: Colors.cardBackground,
    },
    dropDownContainerStyle: {
        marginTop: 12
    },
    recoveryPhrase: {
        //marginBottom: 50
    },
    continueButton: {
        marginLeft: 20,
        marginRight: 20
        //padding: 20,
    }
});

export default SelectWallet;