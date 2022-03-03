import * as bitcoin from 'bitcoinjs-lib';
import ElectrumCli from 'electrum-client'
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
        const peer = await getNextPeer();

        electrumClient = new ElectrumCli(peer.ssl, peer.host, 'tls') // tcp or tls
        await electrumClient.connect() // connect(promise)
        console.log('connected')
        isClientConnected = true;

        electrumClient.onError = (e) => {
            if (isClientConnected) {
                isClientConnected = false;
                console.log("Error: Close the connection")
                electrumClient.close && electrumClient.close();
            }
        }

        const ver = await electrumClient.server_version("bluewallet", '1.4') // json-rpc(promise)
        console.log(`ver : ${ver}`)
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