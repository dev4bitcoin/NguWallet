import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native'

import defaultStyles from '../config/Styles'

function AppText({ children, style, numberOfLines }) {
    return (
        <Text numberOfLines={numberOfLines} style={[defaultStyles.text, style]}>{children}</Text>
    );
}
export default AppText;