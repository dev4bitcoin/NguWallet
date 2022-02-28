import { NavigationContainer } from '@react-navigation/native';
import AppContextProvider from './app/app_modules/appContext';

import FeedNavigator from './app/navigation/FeedNavigator';
import NavigationTheme from './app/navigation/NavigationTheme';


import { LineChart } from 'react-native-wagmi-charts';


const data = [
  {
    timestamp: 1625945400000,
    value: 33575.25
  },
  {
    timestamp: 1625946300000,
    value: 33545.25
  },
  {
    timestamp: 1625947200000,
    value: 33510.25
  },
  {
    timestamp: 1625948100000,
    value: 33215.25
  }
]

export default function App() {


  return (
    // <LineChart.Provider data={data}>
    //   <LineChart>
    //     <LineChart.Path />
    //     {/* <LineChart.CursorCrosshair /> */}
    //     <LineChart.CursorLine />
    //   </LineChart>
    // </LineChart.Provider>
    <AppContextProvider>
      <NavigationContainer theme={NavigationTheme}>
        <FeedNavigator />
      </NavigationContainer>
    </AppContextProvider>
  );
}


