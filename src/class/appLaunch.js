import '../../shim.js'
import electrumClient from '../ngu_modules/electrumClient';

async function setup() {
    await electrumClient.connect();
}

export default {
    setup
}
