import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type HeaderProps = {
    sidebarState: () => void;
};

export default function Header({ sidebarState }: HeaderProps) {
    return (
        <View style={styles.container}>
            {/* Your logo/title */}
            <Text style={styles.title}>Library</Text>

            {/* Button to open/close sidebar */}
            <TouchableOpacity onPress={sidebarState} style={styles.toggle}>
                <Text style={styles.toggleText}>☰</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#000',
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    toggle: {
        padding: 8
    },
    toggleText: {
        color: '#1DB954',
        fontSize: 24
    }
});