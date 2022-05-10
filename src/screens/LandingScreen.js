import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/AntDesign';
import Ionicon from 'react-native-vector-icons/Ionicons';

import routes from '../navigation/routes';
import Colors from '../config/Colors';
import WalletNavigator from '../navigation/WalletNavigator';
import ExplorerNavigator from '../navigation/ExplorerNavigator';
import { AppContext } from '../ngu_modules/appContext';

function LandingScreen() {
  const { showExplorerScreen } = useContext(AppContext);

  const Tab = createBottomTabNavigator();

  return (

    <>
      {!showExplorerScreen &&
        <WalletNavigator />
      }
      {showExplorerScreen &&
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabContainer,
            tabBarItemStyle: styles.tabItemContainer,
            tabBarActiveTintColor: Colors.gold,
          }}
          initialRouteName={routes.HOME}>
          <Tab.Screen
            name="Wallet"
            component={WalletNavigator}
            options={{
              tabBarShowLabel: false,
              tabBarIcon: ({ color }) => (
                <Icon name="wallet" color={color} size={28} />
              ),
            }} />
          <Tab.Screen
            name="Explorer"
            component={ExplorerNavigator}
            options={{
              tabBarShowLabel: false,
              tabBarIcon: ({ color }) => (
                <Ionicon name="cube-outline" color={color} size={28} />
              ),
            }} />
        </Tab.Navigator>
      }
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabContainer: {
    backgroundColor: Colors.appBackground,
    borderTopColor: Colors.textGray,
    borderTopWidth: 0.3,
    height: 45,
    paddingBottom: 0,
    marginBottom: 0
  },
  tabBarLabelStyle: {
    fontSize: 14,
    paddingTop: 2
  }
});

export default LandingScreen;