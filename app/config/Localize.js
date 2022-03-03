import LocalizedStrings from 'react-native-localization';

import en from '../loc/en'

let localize = new LocalizedStrings({
    "en-US": en
})

function getLabel(key) {
    return localize[key];
}

export default { getLabel };