import { Platform } from 'react-native'
import Colors from './Colors'

export default {
    Colors,
    text: {
        fontSize: 18,
        fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
        color: Colors.dark
    }
}