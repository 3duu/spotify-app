// src/components/Player.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useAppDispatch, useAppSelector } from '../store';
import { setPlaying, setPaused } from '../store/slices/playerSlice';
import api, { TrackMeta } from '../services/api';

export default function Player() {
    const dispatch = useAppDispatch();
    const { currentTrackId, isPlaying } = useAppSelector(s => s.player);

    const [track, setTrack]         = useState<TrackMeta | null>(null);
    const [loading, setLoading]     = useState(false);
    const [player, setPlayer]       = useState<AudioPlayer | null>(null);
    const [position, setPosition]   = useState(0);  // seconds
    const [duration, setDuration]   = useState(0);  // seconds

    // 1) When track ID changes, unload old player and load metadata + new player
    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);

            // unload previous
            if (player) {
                player.release();
                setPlayer(null);
            }

            if (!currentTrackId) {
                setTrack(null);
                setLoading(false);
                return;
            }

            // fetch metadata (including duration!)
            const { data } = await api.get<TrackMeta>(`/tracks/${currentTrackId}`);
            if (!active) return;

            setTrack(data);
            setDuration(data.duration);

            // create new player
            const p = createAudioPlayer({ uri: api.getUri() + data.audio_url });
            setPlayer(p);
            setLoading(false);

            // auto-play if redux says so
            if (isPlaying) {
                p.play();
            }
        })().catch(console.error);

        return () => {
            active = false;
            player?.release();
        };
    }, [currentTrackId]);

    // 2) Poll the player's built-in props every 500ms
    useEffect(() => {
        if (!player) return;
        const iv = setInterval(() => {
            // these are provided by AudioPlayer
            setPosition(player.currentTime);   // in seconds :contentReference[oaicite:1]{index=1}
            setDuration(player.duration);      // in seconds :contentReference[oaicite:2]{index=2}
        }, 500);
        return () => clearInterval(iv);
    }, [player]);

    // 3) Sync play/pause when isPlaying toggles
    useEffect(() => {
        if (!player || loading) return;
        isPlaying ? player.play() : player.pause();
    }, [isPlaying, player, loading]);

    const onPlayPress = () => {
        dispatch(isPlaying ? setPaused() : setPlaying());
    };

    // ratio for progress bar fill
    const ratio = duration > 0 ? Math.min(position / duration, 1) : 0;

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {track ? (
                    <Image
                        source={{ uri: api.getUri() + track.album_art }}
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

            {/* Progress bar */}
            <View style={styles.progressBackground}>
                <View style={[styles.progressFill,  { flex: ratio }]} />
                <View style={[styles.progressEmpty, { flex: 1 - ratio }]} />
            </View>
        </View>
    );
}

const PLAYER_HEIGHT = 70;

const styles = StyleSheet.create({
    wrapper: {
        // leave this un-flexed so it doesn’t push other content
    },
    progressBackground: {
        flexDirection: 'row',
        height: 4,
        backgroundColor: '#333',
        marginTop: 4,      // ← add spacing
    },
    progressFill: {
        backgroundColor: '#1DB954',
    },
    progressEmpty: {
        backgroundColor: 'transparent',
    },

    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        height: PLAYER_HEIGHT,
    },
    art: {
        width: 50, height: 50, borderRadius: 4, marginRight: 12,
    },
    artPlaceholder: {
        width: 50, height: 50, borderRadius: 4, backgroundColor: '#333', marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,      // allow shrink on web
    },
    title: {
        color: '#fff', fontSize: 15, fontWeight: '600', flexShrink: 1,
    },
    artist: {
        color: '#aaa', fontSize: 12, flexShrink: 1,
    },
    playButton: {
        padding: 8,
    },
    icon: {
        marginHorizontal: 16,
    },
});
