import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useAppDispatch, useAppSelector } from '../store';
import { setPlaying, setPaused } from '../store/slices/playerSlice';
import api from '../services/api';

interface TrackMeta {
    id:        string;
    title:     string;
    artist:    string;
    audio_url: string;
    album_art?:string;
}

export default function Player() {
    const dispatch = useAppDispatch();
    const { currentTrackId, isPlaying } = useAppSelector(s => s.player);
    const [track, setTrack] = useState<TrackMeta | null>(null);
    const [loading, setLoading] = useState(false);

    // Get an AudioPlayer instance
    const player = useAudioPlayer();

    // 1) When track ID changes, fetch metadata & replace in player
    useEffect(() => {
        let active = true;

        async function loadTrack() {
            setLoading(true);

            // If no track selected, unload and clear state
            if (!currentTrackId) {
                player.remove();
                setTrack(null);
                setLoading(false);
                return;
            }

            try {
                // Fetch track info
                const { data } = await api.get<TrackMeta>(`/tracks/${currentTrackId}`);
                if (!active) return;

                setTrack(data);

                // Load into player (this auto-unloads the old source)
                player.replace({ uri: data.audio_url });

                // If we’re already “playing” in Redux, start immediately
                if (isPlaying) {
                    player.play();
                }
            } catch (err) {
                console.error('Error loading track:', err);
            } finally {
                setLoading(false);
            }
        }

        loadTrack();
        return () => {
            active = false;
            player.remove(); // cleanup when unmounting or track changes
        };
    }, [currentTrackId]);

    // 2) Sync play/pause toggles
    useEffect(() => {
        if (loading) return;            // don’t interrupt while loading
        if (player.isBuffering) return; // wait until buffering completes

        if (isPlaying) player.play();
        else player.pause();
    }, [isPlaying]);

    const onPlayPress = () => {
        dispatch(isPlaying ? setPaused() : setPlaying());
    };

    // Determine whether to show spinner or button
    const showSpinner = loading || player.isBuffering;

    return (
        <View style={styles.container}>
            {track ? (
                <Image
                    source={{
                        uri:
                            track.album_art ??
                            track.audio_url.replace('/audio', '/album-art.png')
                    }}
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

            {showSpinner ? (
                <ActivityIndicator color="#fff" style={styles.icon} />
            ) : (
                <TouchableOpacity onPress={onPlayPress} style={styles.playButton}>
                    <MaterialIcons
                        name={player.playing ? 'pause' : 'play-arrow'}
                        size={32}
                        color="#fff"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const PLAYER_HEIGHT = 70;

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
        marginRight: 12
    },
    artPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 4,
        backgroundColor: '#333',
        marginRight: 12
    },
    info: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    artist: {
        color: '#ccc',
        fontSize: 12
    },
    playButton: {
        padding: 8
    },
    icon: {
        marginHorizontal: 16
    }
});
