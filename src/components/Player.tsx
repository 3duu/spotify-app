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
import { useAudioPlayer } from 'expo-audio';            // expo-audio hook :contentReference[oaicite:1]{index=1}
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

    const [track, setTrackMeta] = useState<TrackMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const player = useAudioPlayer();                      // create AudioPlayer instance

    // 1) When track ID changes, fetch metadata & load into player
    useEffect(() => {
        let mounted = true;
        async function load() {
            // Unload previous audio
            player.remove();

            if (!currentTrackId) {
                setTrackMeta(null);
                return;
            }

            setLoading(true);
            const res = await api.get<TrackMeta>(`/tracks/${currentTrackId}`);
            if (!mounted) return;

            setTrackMeta(res.data);
            // Replace the source in the player (can be a require or remote URI)
            player.replace({ uri: res.data.audio_url });
            setLoading(false);

            // If global state says “playing”, start immediately
            if (isPlaying) {
                player.play();
            }
        }

        load().catch(console.error);
        return () => { mounted = false; player.remove(); };
    }, [currentTrackId]);

    // 2) Sync play/pause button with player
    useEffect(() => {
        if (loading) return;
        if (isPlaying) {
            player.play();
        } else {
            player.pause();
        }
    }, [isPlaying, loading]);

    // UI handler for play/pause tap
    const onPlayPress = () => {
        dispatch(isPlaying ? setPaused() : setPlaying());
    };

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

const PLAYER_HEIGHT = 70;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems:    'center',
        backgroundColor:'transparent',
        paddingHorizontal:16,
        height: PLAYER_HEIGHT,
    },
    art: {
        width: 50, height: 50, borderRadius:4, marginRight:12
    },
    artPlaceholder: {
        width: 50, height:50, borderRadius:4, backgroundColor:'#333', marginRight:12
    },
    info: {
        flex:1, justifyContent:'center'
    },
    title: {
        color:'#fff', fontSize:16, fontWeight:'bold'
    },
    artist: {
        color:'#ccc', fontSize:12
    },
    playButton: {
        padding:8
    },
    icon: {
        marginHorizontal:16
    }
});
