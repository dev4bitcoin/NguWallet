import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';

import AppContextProvider from './src/ngu_modules/appContext';
import appLaunch from './src/class/appLaunch';

import FeedNavigator from './src/navigation/FeedNavigator';
import NavigationTheme from './src/navigation/NavigationTheme';


export default function App() {
  useEffect(() => {
    console.log('app launch from app.js')
    appLaunch.setup();
  }, [])

  return (
    <AppContextProvider>
      <NavigationContainer theme={NavigationTheme}>
        <FeedNavigator />
      </NavigationContainer>
    </AppContextProvider>
  );
}


