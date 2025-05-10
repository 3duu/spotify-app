import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = { title: string; onPress: () => void };
export const SpotifyButton = ({ title, onPress }: Props) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: { backgroundColor: '#1DB954', padding: 12, borderRadius: 24, alignItems: 'center' },
    text: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});