import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import api, {getTrack, TrackMeta} from '../services/api';

export default function TrackDetails({ route }: any) {
    const { id } = route.params;
    const [track, setTrack] = useState<TrackMeta | null>(null);
    const [loading, setLoading] = useState(false);

    // create the player instance
    const player = useAudioPlayer();

    // 1) Fetch track metadata & load into player
    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            const data = await getTrack(id);
            if (!mounted) return;

            setTrack(data);
            // replace the source; hook handles unloading old audio
            player.replace({ uri: data.audio_url });
            setLoading(false);
            // autoplay on load
            player.play();
        }
        load().catch(console.error);

        return () => {
            mounted = false;
            player.remove();
        };
    }, [id]);

    // 2) Toggle play/pause on button press
    const onPlayPause = () => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    if (!track) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Image
                    source={{
                        uri: api.getUri() + track.album_art
                    }}
                    style={styles.albumArt}
                    resizeMode="cover"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{track.title}</Text>
                    <Text style={styles.artist}>{track.artist || 'Unknown Artist'}</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#1DB954" style={{ marginTop: 20 }} />
            ) : (
                <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
                    <MaterialIcons
                        name={player.playing ? 'pause-circle-filled' : 'play-circle-filled'}
                        size={64}
                        color="#1DB954"
                    />
                </TouchableOpacity>
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    loader: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#121212' },
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    },
    albumArt: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8
    },
    artist: {
        color: '#aaa',
        fontSize: 18,
        marginBottom: 32
    },
    playButton: {
        marginTop: 16
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    textContainer: {
        flex: 1,
    },
});
