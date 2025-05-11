import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type HeaderProps = {
    sectionTitle: string;
    userImage: string;
    //sidebarState: () => void;
};

export default function Header({ sectionTitle, userImage/*, sidebarState*/ } : Readonly<HeaderProps>) {
    return (
        <View style={styles.container}>
            <Image source={{ uri: userImage }} style={styles.avatar} />
            <Text style={styles.title}>{sectionTitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#000',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});