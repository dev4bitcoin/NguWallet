import electrumClient from "../app_modules/electrumClient";

async function setup() {
    await electrumClient.connect();
}

export default {
    setup
}
