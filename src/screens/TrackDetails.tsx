import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Audio } from 'expo-av';
import { getRecentTracks } from '../services/api';

// @ts-ignore
export default function TrackDetails({ route }) {
    const { id } = route.params;
    const [track, setTrack] = useState<any>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    useEffect(() => {
        getRecentTracks().then(tracks => setTrack(tracks.find(t => t.id === id)));
        return () => { if (sound) sound.unloadAsync(); };
    }, []);

    const playAudio = async () => {
        if (sound) {
            await sound.playAsync();
        } else {
            const { sound: s } = await Audio.Sound.createAsync({ uri: track.audio_url });
            setSound(s);
            await s.playAsync();
        }
    };

    if (!track) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{track.name}</Text>
            <Text style={styles.artist}>{track.artist}</Text>
            <Button title="Play" onPress={playAudio} color="#1DB954" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    title: { color: '#fff', fontSize: 24, marginBottom: 8 },
    artist: { color: '#ccc', fontSize: 18, marginBottom: 16 }
});