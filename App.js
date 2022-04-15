import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import RNBootSplash from "react-native-bootsplash";
import ReactNativeBiometrics from 'react-native-biometrics'

import AppContextProvider from './src/ngu_modules/appContext';
import appLaunch from './src/class/appLaunch';

import FeedNavigator from './src/navigation/FeedNavigator';
import NavigationTheme from './src/navigation/NavigationTheme';
import OfflineNotice from './src/components/OfflineNotice';
import storage from './src/ngu_modules/storage';
import Localize from './src/config/Localize';
import Constants from './src/config/Constants';
import { Alert } from 'react-native';
import AppAlert from './src/components/AppAlert';

export default function App() {
  const [showAlert, setShowAlert] = useState(false);

  const authenticateBiometricsIfAvailable = () => {
    ReactNativeBiometrics.simplePrompt({ promptMessage: Localize.getLabel('confirmIdentityMessage') })
      .then((resultObject) => {
        const { success } = resultObject

        if (success) {
          // successful biometrics provided
          RNBootSplash.hide();

        } else {
          // user cancelled biometric prompt
        }
      })
      .catch(() => {
        // biometrics failed
      })
  }

  const validateBiometricsIfEnabled = async () => {
    const status = await storage.getItem(Constants.BIOMETRICS_DISPLAY_STATUS);

    if (!status) {
      RNBootSplash.hide();
      return;
    }

    if (status) {
      authenticateBiometricsIfAvailable();
    } ß
  }

  const onReady = () => {
    if (global.useTestnet === true) {
      setShowAlert(true);
    }
  }

  useEffect(() => {
    validateBiometricsIfEnabled();
    appLaunch.setup();
  }, [])

  return (
    <AppContextProvider>
      <AppAlert
        visible={showAlert}
        isAlert={true}
        title={Localize.getLabel('warning')}
        message={Localize.getLabel('warningTestnetText')}
        onCancel={() => setShowAlert(false)}
      />
      <OfflineNotice />
      <NavigationContainer onReady={onReady} theme={NavigationTheme}>
        <FeedNavigator />
      </NavigationContainer>
    </AppContextProvider>
  );
}


