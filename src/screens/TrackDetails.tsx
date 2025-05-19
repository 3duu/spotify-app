import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import api, {getTrack, TrackMeta} from '../services/api';
import { MaterialCommunityIcons, MaterialIcons  } from '@expo/vector-icons';

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
            player.replace({ uri: api.getUri() + data.audio_url });
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
        <View style={styles.trackContainer}>
            <View style={styles.trackRow}>
                <Image source={{ uri: api.getUri() + track.album_art }} style={styles.albumArt} />

                <View style={styles.trackText}>
                    <Text numberOfLines={1} style={styles.titleArtist}>
                        {track.title} • {track.artist}
                    </Text>
                    <Text style={styles.deviceText}>🔊 AIWA Boombox BBS-01</Text>
                </View>

                <View style={styles.actions}>
                    <MaterialCommunityIcons name="speaker" size={20} color="#1DB954" />
                    <TouchableOpacity onPress={onPlayPause}>
                        <MaterialIcons
                            name={player.playing ? 'pause' : 'play-arrow'}
                            size={28}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.progressBar} />
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
    trackContainer: {
        backgroundColor: '#2c0f0f',
        padding: 8,
        borderRadius: 8,
    },

    trackRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 10,
    },

    trackText: {
        flex: 1,
        justifyContent: 'center',
    },

    titleArtist: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },

    deviceText: {
        fontSize: 12,
        color: '#1DB954',
    },

    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    progressBar: {
        height: 2,
        backgroundColor: '#fff',
        marginTop: 6,
        width: '70%', // optional, animate width for progress
    },
});
