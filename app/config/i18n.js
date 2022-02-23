import i18n from "i18n-js";
import * as Localization from 'expo-localization'

import en from '../loc/en'

i18n.translations = {
    'en': en
}

i18n.locale = Localization.locale.search(/-|_/) !== -1 ? Localization.locale.slice(0, 2) : Localization.locale;
i18n.fallbacks = true;

export default i18n;