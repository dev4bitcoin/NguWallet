import * as bitcoin from 'bitcoinjs-lib';
const ElectrumCli = require('electrum-client');
import { Alert } from 'react-native';


const defaultPeer = { host: 'electrum1.bluewallet.io', ssl: '443' };
const predefinedPeers = [
    { host: 'electrum1.bluewallet.io', ssl: '443' },
    { host: 'electrum2.bluewallet.io', ssl: '443' },
    { host: 'electrum.acinq.co', ssl: '50002' },
    { host: 'electrum.bitaroo.net', ssl: '50002' },
];

let electrumClient;
let isClientConnected = false;
let currentPeerIndex = Math.floor(Math.random() * predefinedPeers.length);
let connectionAttempt = 0;

async function connect() {
    try {
        console.log('connect')
        const peer = await getNextPeer();

        console.log(peer)
        electrumClient = new ElectrumCli(global.net, global.tls, peer.ssl, peer.host, peer.ssl ? 'tls' : 'tcp') // tcp or tls

        const ver = await electrumClient.initElectrum({ client: 'bluewallet', version: '1.4' });
        console.log(`ver : ${ver}`)

        isClientConnected = true;

        electrumClient.onError = (e) => {
            if (isClientConnected) {
                isClientConnected = false;
                console.log("Error: Close the connection")
                electrumClient.close && electrumClient.close();
            }
        }
    }
    catch (e) {
        isClientConnected = false;
        console.log(e)
    }

    if (!isClientConnected) {
        console.log('Attempt to retry');
        connectionAttempt++;
        console.log("Close the connection before attempting again");
        electrumClient.close && electrumClient.close();
        if (connectionAttempt >= 5) {
            Alert.alert('Coult not find the working electrum server. Please try again later');
        }
        else {
            console.log(`Reconnection attempt #${connectionAttempt}`)
            await new Promise(resolve => setTimeout(resolve, 500));
            return connect();
        }
    }
}

async function getCurrentPeer() {
    return predefinedPeers[currentPeerIndex];
}

async function getNextPeer() {
    const peer = getCurrentPeer();
    currentPeerIndex++;
    if (currentPeerIndex + 1 > predefinedPeers.length) {
        currentPeerIndex = 0;
    }
    return peer;
}

async function ping() {
    if (electrumClient) {
        try {
            await electrumClient.server_ping();
        }
        catch (ex) {
            isClientConnected = false;
            return false;
        }
        return true;
    }
    return false;
}

export default {
    connect,
    ping
}