import './shim.js'
import { NavigationContainer } from '@react-navigation/native';
import AppContextProvider from './app/app_modules/appContext';

import FeedNavigator from './app/navigation/FeedNavigator';
import NavigationTheme from './app/navigation/NavigationTheme';


export default function App() {
  return (
    <AppContextProvider>
      <NavigationContainer theme={NavigationTheme}>
        <FeedNavigator />
      </NavigationContainer>
    </AppContextProvider>
  );
}


