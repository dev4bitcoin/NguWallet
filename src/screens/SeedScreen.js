import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { View, StyleSheet, ScrollView } from 'react-native';
import AppActivityIndicator from '../components/AppActivityIndicator';
import AppButton from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
import walletDiscovery from '../helpers/walletDiscovery';
import routes from '../navigation/routes';

function SeedScreen({ route, navigation }) {
    const { name, type, seedPhraseLength } = route.params;
    const [seedIndex, setSeedIndex] = useState(1);
    const startingPercentage = seedPhraseLength === 12 ? 50 : 25;
    const [progressPercentage, setProgressPercentage] = useState(startingPercentage);
    const [seedList, setSeedList] = useState([]);
    const [data, setData] = useState([]);
    const [seedPhrase, setSeedPhrase] = useState();
    const [buttonTitle, setButtonTitle] = useState(Localize.getLabel('next'));
    const [loading, setLoading] = useState(false);

    const createWallet = async () => {
        setLoading(true);
        const walletClass = await walletDiscovery.getWalletInstance({ id: null, type: type });
        await walletClass.saveWalletToDisk(type, name, seedPhrase);
        setLoading(false);
        navigation.navigate(routes.SUCCESS);
    }

    const onNext = async () => {
        if (seedIndex === 1) {
            setData(seedList.slice(6, 12));
            setSeedIndex(2);
            setProgressPercentage(50);
            if (seedPhraseLength === 12) {
                setProgressPercentage(100);
                setButtonTitle(Localize.getLabel('create'))
            }
        }
        if (seedIndex === 2) {
            if (seedPhraseLength === 12) {
                await createWallet()
                return;
            }
            setData(seedList.slice(12, 18));
            setProgressPercentage(75);
            setSeedIndex(3);
        }
        if (seedIndex === 3) {
            setData(seedList.slice(18, 24));
            setSeedIndex(4);
            setProgressPercentage(100);
            setButtonTitle(Localize.getLabel('create'))
        }
        if (seedIndex === 4) {
            await createWallet();
            return;
        }
    }

    const getSeed = async () => {
        const walletClass = await walletDiscovery.getWalletInstance({ id: null, type: type });
        const seed = walletClass.generateSeed(seedPhraseLength);
        setSeedPhrase(seed);
        const seedArray = seed.split(' ');
        let wordList = [];
        let id = 1;
        for (const index in seedArray) {
            wordList.push({ id: id, value: seedArray[index] });
            id++;
        }
        setSeedList(wordList);
        setData(wordList.slice(0, 6));
    }

    useEffect(() => {
        getSeed();
    }, [])

    const renderItem = ({ item }) => {
        return (
            <View style={styles.seedWord}>
                <AppText style={styles.key}>{item.id}</AppText>
                <AppText style={styles.value}> {item.value}</AppText>
            </View>)
    };

    return (
        <>
            <AppActivityIndicator visible={loading} />
            <View style={styles.container}>
                <AppText style={styles.header}>{Localize.getLabel('writeDownTheWords')}</AppText>
                <AppText style={styles.subHeader}>{Localize.getLabel('writeDownThePhrase')}</AppText>
                <View style={styles.progress}>
                    <ProgressBar percentage={progressPercentage} />
                </View>
                <FlatList
                    style={styles.list}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}>
                </FlatList>
                <View style={styles.next}>
                    <AppButton
                        onPress={onNext}
                        title={buttonTitle}
                        leftIcon={false}
                        rightIcon={true}
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
        margin: 20
    },
    header: {
        color: Colors.white,
        fontSize: 30,
        width: '60%',
        fontWeight: 'bold',
        paddingBottom: 20
    },
    subHeader: {
        color: Colors.white,
    },
    progress: {
        marginTop: 20
    },
    next: {
        marginTop: 50
    },
    list: {
        paddingTop: 20
    },
    seedWord: {
        flexDirection: 'row',
        padding: 5,
        justifyContent: 'center'
    },
    key: {
        color: Colors.lightBlue,
        fontSize: 20,
        fontWeight: 'bold'
    },
    value: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    }
});

export default SeedScreen;