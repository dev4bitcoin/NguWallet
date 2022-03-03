import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import AppContextProvider from './app/app_modules/appContext';
//import appLaunch from './app/class/appLaunch';

import FeedNavigator from './app/navigation/FeedNavigator';
import NavigationTheme from './app/navigation/NavigationTheme';


export default function App() {
  useEffect(() => {
    //appLaunch.setup();
  }, [])

  return (
    <AppContextProvider>
      <NavigationContainer theme={NavigationTheme}>
        <FeedNavigator />
      </NavigationContainer>
    </AppContextProvider>
  );
}


