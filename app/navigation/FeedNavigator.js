import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Icon from 'react-native-vector-icons/FontAwesome';

import Colors from "../config/Colors";
import Localize from "../config/Localize";
import CurrencyScreen from "../screens/CurrencyScreen";

import HomeScreen from "../screens/HomeScreen";
import PriceHistory from "../screens/PriceHistory";
import SettingsScreen from "../screens/SettingsScreen";
import routes from "./routes";

const Stack = createNativeStackNavigator();

const FeedNavigator = ({ navigation }) => (
    <Stack.Navigator
        mode="card"
        screenOptions={{
            headerMode: 'screen',
            headerTintColor: 'white',
            headerStyle: { backgroundColor: Colors.backgroundDark, marginLeft: 20 },
            headerShown: false,
            headerBackTitleVisible: false,
            headerTitleAlign: 'center'
        }}>
        <Stack.Screen
            name={routes.HOME}
            component={HomeScreen}
            options={{ headerShown: false }} />
        <Stack.Screen
            name={routes.SETTINGS}
            component={SettingsScreen}
            mode="modal"
            options={{ headerShown: false }} />
        <Stack.Group
            screenOptions={({ navigation }) => ({
                headerShown: true,
                //headerStyle: { backgroundColor: Colors.backgroundDark, textAlign: 'center' },

                headerLeft: () => <Icon name="chevron-left" color={Colors.light} size={20} onPress={() => { navigation.goBack() }} />,
            })}
        >
            <Stack.Screen
                name={routes.CURRECNCY_SELECTION}
                component={CurrencyScreen}
                options={{ headerShown: true, title: Localize.getLabel('referenceExhangeRate') }}
            />
            <Stack.Screen
                name={routes.PRICE_HISTORY}
                component={PriceHistory}
                options={{ title: Localize.getLabel('priceHistory') }}
            />
        </Stack.Group>
    </Stack.Navigator>
)

export default FeedNavigator;