import electrumClient from "../app_modules/electrumClient";
//import '../../shim.js'

async function setup() {
    await electrumClient.connect();
}

export default {
    setup
}
