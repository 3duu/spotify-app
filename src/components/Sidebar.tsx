import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Sidebar = () => (
    <View style={styles.container}>
        <TouchableOpacity><Text style={styles.link}>Home</Text></TouchableOpacity>
        {/* ...other nav items... */}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', padding: 16 },
    link: { color: '#1DB954', fontSize: 18, marginVertical: 8 }
});

export default Sidebar;