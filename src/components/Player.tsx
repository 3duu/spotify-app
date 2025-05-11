import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { playPause } from '../store/slices/playerSlice';
import { api } from '../services/api';

interface TrackMeta {
    id: string;
    title: string;
    artist: string;
    audio_url: string;
}

export default function Player() {
    const dispatch = useAppDispatch();
    const { isPlaying, currentTrackId } = useAppSelector(state => state.player);
    const [track, setTrack] = useState<TrackMeta | null>(null);

    useEffect(() => {
        if (currentTrackId) {
            api.get(`/tracks/${currentTrackId}`).then(res => setTrack(res.data));
        }
    }, [currentTrackId]);

    // If no track loaded yet, you might show a placeholder or keep the bar visible
    const title = track ? track.title : 'Not Playing';
    const artist = track ? track.artist : '';

    return (
        <View style={styles.container}>
            {track ? (
                <Image
                    source={{ uri: track.audio_url.replace('/media/song.mp3', '/media/album-art.png') }}
                    style={styles.art}
                />
            ) : (
                <View style={styles.artPlaceholder} />
            )}

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
            </View>

            <MaterialIcons name="cast-connected" size={24} color="#fff" style={styles.icon} />
            <TouchableOpacity onPress={() => dispatch(playPause())} style={styles.playButton}>
                <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const TAB_BAR_HEIGHT = 56;
const PLAYER_HEIGHT = 80;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(5, 44, 44, 0.5)',
        paddingHorizontal: 16,
        height: PLAYER_HEIGHT,
    },
    art: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
    },
    artPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 4,
        backgroundColor: '#333',
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    artist: {
        color: '#ccc',
        fontSize: 12,
    },
    icon: {
        marginHorizontal: 16,
    },
    playButton: {
        padding: 8,
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: TAB_BAR_HEIGHT,
        height: PLAYER_HEIGHT,
        backgroundColor: '#181818',
        zIndex: 1000,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: PLAYER_HEIGHT + 16,
    },
});