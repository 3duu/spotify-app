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
import api, {TrackMeta} from '../services/api';

export default function Player() {
    const dispatch = useAppDispatch();
    const { currentTrackId, isPlaying } = useAppSelector(s => s.player);

    const [track, setTrack]         = useState<TrackMeta | null>(null);
    const [loading, setLoading]     = useState(false);
    const [player, setPlayer]       = useState<AudioPlayer | null>(null);

    // 1) Whenever the track ID changes, tear down the old player and create a new one
    useEffect(() => {
        let active = true;

        async function loadTrack() {
            setLoading(true);

            // 1a) Tear down any existing player
            if (player) {
                player.release();
                setPlayer(null);
            }

            // 1b) If there's no track selected, just clear state
            if (!currentTrackId) {
                setTrack(null);
                setLoading(false);
                return;
            }

            // 1c) Fetch the metadata from your backend
            const { data } = await api.get<TrackMeta>(`/tracks/${currentTrackId}`);
            if (!active) return;
            setTrack(data);

            // 1d) Create a fresh AudioPlayer for this URI
            const newPlayer = createAudioPlayer({ uri: api.getUri() + data.audio_url });
            setPlayer(newPlayer);
            setLoading(false);

            // 1e) If Redux says we should already be playing, kick it off
            if (isPlaying) {
                newPlayer.play();
            }
        }

        loadTrack().catch(console.error);

        return () => {
            active = false;
            // release when unmounting or before loading the next
            player?.release();
        };
    }, [currentTrackId]);

    // 2) Sync play/pause toggles
    useEffect(() => {
        if (!player || loading) return;
        if (isPlaying) player.play();
        else player.pause();
    }, [isPlaying, player, loading]);

    const onPlayPress = () => {
        dispatch(isPlaying ? setPaused() : setPlaying());
    };

    const showSpinner = loading;

    return (
        <View style={styles.container}>
            {track ? (
                <Image
                    source={{
                        uri: api.getUri() + track.album_art
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
        alignItems: 'center',
        backgroundColor: 'rgba(5, 44, 44, 0.5)',
        paddingHorizontal: 16,
        height: PLAYER_HEIGHT,
    },
    art: {
        width: 50, height: 50, borderRadius:4, marginRight:12
    },
    artPlaceholder: {
        width: 50, height:50, borderRadius:4, backgroundColor:'#333', marginRight:12
    },
    info: {
        flex: 1, justifyContent: 'center'
    },
    title: {
        color:'#fff', fontSize:15, fontWeight:'600'
    },
    artist: {
        color:'#aaa', fontSize:12
    },
    playButton: {
        padding:8
    },
    icon: {
        marginHorizontal:16
    }
});
