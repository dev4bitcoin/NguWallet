import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/AntDesign';

import Colors from '../config/Colors';

function CollapsiblePane({ title, content }) {
    const [activeSections, setActiveSections] = useState([])
    const SECTIONS = [
        {
            title: title,
            content: content,
        },
    ];

    const renderHeader = section => {
        return (
            <View style={styles.header}>
                <Text style={styles.headerText}>{section.title}</Text>
                <Icon
                    name="caretdown"
                    size={19}
                    color={Colors.black}
                    style={styles.icon} />
            </View>
        );
    };

    const renderContent = section => {
        return (
            <View style={styles.contentArea}>
                <Text style={styles.content}>{section.content}</Text>
            </View>
        );
    };

    const updateSections = activeSections => {
        setActiveSections(activeSections);
    };

    return (
        <View style={styles.container}>
            <Accordion
                sections={SECTIONS}
                underlayColor={Colors.white}
                activeSections={activeSections}
                renderHeader={renderHeader}
                renderContent={renderContent}
                onChange={updateSections}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: Colors.white,
        borderRadius: 5,
        padding: 10
    },
    contentArea: {
        paddingTop: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '95%'
    },
    content: {
        fontSize: 18,
    },
    icon: {
        flexDirection: 'row-reverse',
        paddingRight: 10
    }
});

export default CollapsiblePane;