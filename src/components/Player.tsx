import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {Audio, AVPlaybackStatusSuccess} from 'expo-av';
import { useAppDispatch, useAppSelector } from '../store';
import api from '../services/api';
import { setPlaying, setPaused } from '../store/slices/playerSlice';

interface TrackMeta {
    id: string;
    title: string;
    artist: string;
    audio_url: string;
    album_art?: string;
}

export default function Player() {
    const dispatch = useAppDispatch();
    const { isPlaying, currentTrackId } = useAppSelector(s => s.player);
    const [track, setTrack] = useState<TrackMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);

    // 1) When the track ID changes, fetch metadata and load the sound.
    useEffect(() => {
        let isMounted = true;

        async function loadTrack() {
            if (!currentTrackId) {
                // nothing to play
                await cleanupSound();
                setTrack(null);
                return;
            }

            setLoading(true);
            const res = await api.get<TrackMeta>(`/tracks/${currentTrackId}`);
            const data = res.data;
            if (!isMounted) return;

            setTrack(data);

            // Unload previous
            await cleanupSound();

            // Create a new sound instance
            const { sound } = await Audio.Sound.createAsync(
                { uri: data.audio_url },
                { shouldPlay: false }
            );
            soundRef.current = sound;

            setLoading(false);
            // If the global player state says "playing", start playback immediately
            if (isPlaying) {
                await sound.playAsync();
            }
        }

        loadTrack().catch(console.error);

        return () => {
            isMounted = false;
            cleanupSound();
        };
    }, [currentTrackId]);

    // 2) When play/pause toggles, call the appropriate Sound API
    useEffect(() => {
        async function toggleSound() {
            const sound = soundRef.current;
            if (!sound) return;

            const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
            if (isPlaying && !status.isPlaying) {
                await sound.playAsync();
            } else if (!isPlaying && status.isPlaying) {
                await sound.pauseAsync();
            }
        }
        toggleSound().catch(console.error);
    }, [isPlaying]);

    // Helper to unload the current sound
    async function cleanupSound() {
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        } catch (e) {
            console.warn('Error unloading sound', e);
        }
    }

    // UI handlers
    const onPlayPress = () => {
        dispatch(isPlaying ? setPaused() : setPlaying());
    };

    // Render
    return (
        <View style={styles.container}>
            {track ? (
                <Image
                    source={{ uri: track.album_art ?? track.audio_url.replace('/audio','/album-art.png') }}
                    style={styles.art}
                />
            ) : (
                <View style={styles.artPlaceholder} />
            )}

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                    {track?.title ?? 'Not Playing'}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {track?.artist ?? ''}
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator color="#fff" style={styles.icon} />
            ) : (
                <TouchableOpacity onPress={onPlayPress} style={styles.playButton}>
                    <MaterialIcons
                        name={isPlaying ? 'pause' : 'play-arrow'}
                        size={32}
                        color="#fff"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

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
    playButton: {
        padding: 8,
    },
    icon: {
        marginHorizontal: 16,
    },
});
