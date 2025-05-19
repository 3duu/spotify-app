import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import api, {getTrack, TrackMeta} from '../services/api';

export default function TrackDetails({ route }: any) {
    const { id } = route.params as { id: string };
    const [track, setTrack]     = useState<TrackMeta | null>(null);
    const [loading, setLoading] = useState(true);

    // 2) Create the player and subscribe to its status
    const player = useAudioPlayer();
    const status = useAudioPlayerStatus(player);

    // 3) Fetch metadata (including duration) and load the audio
    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            const data = await getTrack(id);
            if (!active) return;

            setTrack(data);
            player.replace({ uri: api.getUri() + data.audio_url });
            setLoading(false);
            player.play();
        })().catch(console.error);

        return () => {
            active = false;
            player.remove();
        };
    }, [id]);

    if (!track) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    // 4) Compute fill ratio: currentTime / totalDuration
    const current = status.currentTime  ?? 0;
    const total   = status.duration     ?? track.duration;
    const ratio   = total > 0 ? current / total : 0;

    // 5) Format mm:ss for display
    const fmt = (sec: number) => {
        const m = Math.floor(sec/60).toString().padStart(2,'0');
        const s = Math.floor(sec%60).toString().padStart(2,'0');
        return `${m}:${s}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Image
                    source={{ uri: api.getUri() + (track.album_art ?? '') }}
                    style={styles.art}
                />
                <View style={styles.info}>
                    <Text numberOfLines={1} style={styles.title}>
                        {track.title}
                    </Text>
                    <Text style={styles.artist}>{track.artist}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => status.playing ? player.pause() : player.play()}
                >
                    <MaterialIcons
                        name={status.playing ? 'pause' : 'play-arrow'}
                        size={32}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            {/* 6) Flex-based progress bar */}
            <View style={styles.progressBarWrapper}>
                <View style={styles.progressBackground}>
                    <View style={[styles.progressFill,      { flex: ratio      }]} />
                    <View style={[styles.progressRemaining, { flex: 1 - ratio }]} />
                </View>
                <Text style={styles.timeText}>
                    {fmt(current)} / {fmt(total)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#121212'
    },
    container: {
        flex:1, backgroundColor:'#121212', padding:16
    },
    topRow: {
        flexDirection:'row', alignItems:'center', marginBottom:16
    },
    art: {
        width:50, height:50, borderRadius:4, marginRight:12
    },
    info: {
        flex:1
    },
    title: {
        fontSize:16, fontWeight:'bold', color:'#fff'
    },
    artist: {
        fontSize:12, color:'#aaa', marginTop:4
    },

    progressBarWrapper: {
        marginTop:16
    },
    progressBackground: {
        flexDirection:'row',
        height:4,
        backgroundColor:'#333',
        borderRadius:2,
        overflow:'hidden'
    },
    progressFill: {
        backgroundColor:'#1DB954'
    },
    progressRemaining: {
        backgroundColor:'transparent'
    },
    timeText: {
        color:'#aaa',
        fontSize:10,
        textAlign:'right',
        marginTop:4
    }
});
