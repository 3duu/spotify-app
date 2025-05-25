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
import { player } from '../services/audioPlayer';
import { useAppDispatch, useAppSelector } from '../store';
import { setPlaying, setPaused } from '../store/slices/playerSlice';
import api, {getTrack, TrackMeta} from '../services/api';
import { useNavigation } from '@react-navigation/native';

function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

export default function Player() {
    const dispatch = useAppDispatch();
    const { currentTrackId, isPlaying } = useAppSelector(s => s.player);

    const [track,   setTrack]   = useState<TrackMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const navigation = useNavigation<any>();

    // Load / replace the singleton player whenever the track ID changes
    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);

            // release any previous media
            player?.pause();

            if (!currentTrackId) {
                setTrack(null);
                setLoading(false);
                return;
            }

            // fetch metadata
            const  data  = await getTrack(currentTrackId, { });
            if (!active) return;
            setTrack(data);
            setDuration(data.duration);

            // load the new source onto the same player
            player.replace({ uri: api.getUri() + data.audio_url });
            setLoading(false);

            // auto‐play if redux says so
            if (isPlaying) player.play();
        })().catch(console.error);

        return () => {
            active = false;
            // optionally pause
            player?.pause();
        };
    }, [currentTrackId]);

    // Poll position & duration every 500ms
    useEffect(() => {
        const iv = setInterval(() => {
            setPosition(player.currentTime);
            setDuration(player.duration);
        }, 500);
        return () => clearInterval(iv);
    }, []);

    // Sync play/pause state
    useEffect(() => {
        if (loading) return;
        isPlaying ? player.play() : player.pause();
    }, [isPlaying, loading]);

    const onPlayPress = () => {
        dispatch(isPlaying ? setPaused() : setPlaying());
    };

    const ratio = duration > 0 ? Math.min(position / duration, 1) : 0;

    const bg = track?.color ?? '#000';
    const bg50 = hexToRgba(bg, 0.4);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
                if (currentTrackId) {
                    navigation.navigate('TrackDetails', { id: currentTrackId });
                }
            }}
        >
            <View style={styles.wrapper}>
                <View style={[styles.container, { backgroundColor: bg50 }]}>
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

                <View style={styles.progressBackground}>
                    <View style={[styles.progressFill,  { flex: ratio }]} />
                    <View style={[styles.progressEmpty, { flex: 1 - ratio }]} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const PLAYER_HEIGHT = 70;

const styles = StyleSheet.create({
    wrapper: {},

    progressBackground: {
        flexDirection: 'row',
        height: 4,
        backgroundColor: '#333',
        marginTop: 4,
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
        backgroundColor: 'rgba(5, 44, 44, 0.5)',
        paddingHorizontal: 16,
        height: PLAYER_HEIGHT,
        borderRadius: 8
    },
    art: {
        width: 50,
        height: 50,
        //borderRadius: 4,
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
        minWidth: 0,
    },
    title: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        flexShrink: 1,
    },
    artist: {
        color: '#aaa',
        fontSize: 12,
        flexShrink: 1,
    },
    playButton: {
        padding: 8,
    },
    icon: {
        marginHorizontal: 16,
    },
});
