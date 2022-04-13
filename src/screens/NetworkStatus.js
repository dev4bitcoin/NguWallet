import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../components/Text';
import Colors from '../config/Colors';
import Localize from '../config/Localize';
const ElectrumClient = require('../ngu_modules/electrumClient');

function NetworkStatus(props) {
    const [isElectrumServerOnline, setIsElectrumServerOnline] = useState(false);
    const [serverInfo, setServerInfo] = useState('')
    const checkIfElectrumServerOnline = async () => {
        const isOnline = await ElectrumClient.ping();
        setIsElectrumServerOnline(isOnline);

        const peerInfo = ElectrumClient.getServerInfo();
        setServerInfo(peerInfo);
    }

    useEffect(() => {
        checkIfElectrumServerOnline();
    }, [])

    return (
        <View style={styles.container}>
            <AppText style={styles.text}>{Localize.getLabel('status')}</AppText>
            <View style={isElectrumServerOnline ? styles.online : styles.offline}>
                <AppText style={styles.statusText}>
                    {isElectrumServerOnline ? Localize.getLabel('connected') : Localize.getLabel('notConnected')}
                </AppText>
            </View>
            <AppText style={styles.text}>{serverInfo}</AppText>
            <AppText></AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 20,
        marginRight: 20,
        padding: 20,
        //flex: 1,
        justifyContent: 'center',
    },
    text: {
        marginTop: 20,
        textAlign: 'center',
        color: Colors.white
    },
    statusText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Colors.white
    },
    online: {
        marginTop: 20,
        paddingTop: 7,
        backgroundColor: Colors.priceGreen,
        borderRadius: 5,
        height: 40
    },
    offline: {
        marginTop: 20,
        paddingTop: 7,
        backgroundColor: Colors.priceRed,
        borderRadius: 5,
        height: 40

    }
});

export default NetworkStatus;