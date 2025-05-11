import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type SidebarProps = {
    sidebarState: () => void;
};

export default function Sidebar({ sidebarState }: SidebarProps) {
    return (
        <View style={styles.container}>
            {/* Hamburger icon to toggle the sidebar */}
            <TouchableOpacity onPress={sidebarState} style={styles.toggle}>
                <Text style={styles.link}>☰</Text>
            </TouchableOpacity>
            {/* ...your other nav items here... */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 16
    },
    toggle: {
        marginBottom: 24
    },
    link: {
        color: '#1DB954',
        fontSize: 24
    }
});
