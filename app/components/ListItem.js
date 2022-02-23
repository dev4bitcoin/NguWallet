import React from 'react';
import { View, StyleSheet, Image, TouchableHighlight } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'

import defaultStyles from '../config/Styles'
import AppText from './Text'
import Colors from '../config/Colors';

function ListItem({ title, subTitle, image, onPress, ImageComponent, showChevrons, selected }) {
    return (
        <TouchableHighlight
            underlayColor={Colors.light}
            onPress={onPress}>
            <View style={styles.container}>
                {ImageComponent}
                {image &&
                    <Image style={styles.image} source={image}></Image>}
                <View style={styles.detailsContainer}>
                    <AppText style={styles.title} numberOfLines={2}>{title}</AppText>
                    {subTitle &&
                        <AppText style={styles.subTitle} numberOfLines={3}>{subTitle}</AppText>}
                </View>
                {showChevrons &&
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={30}
                        color={defaultStyles.Colors.white}
                        style={styles.icon}
                    />
                }
                {selected &&
                    <MaterialCommunityIcons
                        name="check"
                        size={30}
                        color={defaultStyles.Colors.white}
                        style={styles.icon}
                    />
                }
            </View>
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: Colors.cardBackground,
        marginBottom: 10
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    subTitle: {
        color: Colors.medium
    },
    title: {
        fontWeight: '800',
        fontSize: 20,
        color: Colors.white
    },
    detailsContainer: {
        marginLeft: 10,
        justifyContent: "center",
        flex: 1
    },
    icon: {
        justifyContent: "center",
        alignSelf: "center"
    },
})

export default ListItem;