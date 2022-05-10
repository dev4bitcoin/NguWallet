import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Icon from 'react-native-vector-icons/FontAwesome';

import Colors from "../config/Colors";
import Localize from "../config/Localize";
import routes from './routes';
import ExplorerScreen from '../screens/Explorer/ExplorerScreen';

const Stack = createNativeStackNavigator();

const ExplorerNavigator = ({ navigation }) => (
    <Stack.Navigator
        mode="card"
        screenOptions={{
            headerMode: 'screen',
            headerTintColor: 'white',
            headerStyle: { backgroundColor: Colors.appBackground, marginLeft: 20 },
            headerShown: false,
            headerBackTitleVisible: false,
            headerTitleAlign: 'center'
        }}>
        <Stack.Screen
            name={routes.EXPLORER}
            component={ExplorerScreen}
            options={{ headerShown: false }} />
    </Stack.Navigator>
)

export default ExplorerNavigator;