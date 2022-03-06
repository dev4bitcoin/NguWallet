import React from 'react';
import { Text } from 'react-native'

import defaultStyles from '../config/Styles'

function AppText({ children, style, numberOfLines, onPress }) {
    return (
        <Text
            numberOfLines={numberOfLines}
            style={[defaultStyles.text, style]}
            onPress={onPress}>{children}</Text>
    );
}
export default AppText;