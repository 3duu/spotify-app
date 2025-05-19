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
import api, { getTrack, TrackMeta } from '../services/api';

export default function TrackDetails({ route }: any) {
    const { id } = route.params as { id: string };
    const [track, setTrack]     = useState<TrackMeta | null>(null);
    const [loading, setLoading] = useState(true);

    // 1) set up audio player and status hook
    const player = useAudioPlayer();
    const status = useAudioPlayerStatus(player);

    // 2) load metadata & audio
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

    // 3) compute progress & toggle play/pause
    const currentSec = status.currentTime ?? 0;
    const totalSec   = status.duration    ?? track.duration;
    const ratio      = totalSec > 0 ? currentSec / totalSec : 0;

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
                    <Text style={styles.title}>{track.title}</Text>
                    <Text style={styles.artist}>Artist</Text>
                    {/*<Text style={styles.artist}>{track.artist}</Text>*/}
                </View>
                <TouchableOpacity
                    onPress={() =>
                        status.playing ? player.pause() : player.play()
                    }
                >
                    <MaterialIcons
                        name={status.playing ? 'pause' : 'play-arrow'}
                        size={32}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            {/* flex‐based progress bar */}
            <View style={styles.progressWrapper}>
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill,      { flex: ratio }]} />
                    <View style={[styles.progressRemain,    { flex: 1 - ratio }]} />
                </View>
                <Text style={styles.time}>
                    {fmt(currentSec)} / {fmt(totalSec)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loader: { flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#121212' },
    container: { flex:1,backgroundColor:'#121212',padding:16 },
    topRow:    { flexDirection:'row',alignItems:'center',marginBottom:16 },
    art:       { width:50,height:50,borderRadius:4,marginRight:12 },
    info:      { flex:1 , justifyContent: 'center',},
    title:     { color:'#fff',fontSize:16,fontWeight:'bold' },
    artist:    { color:'#aaa',fontSize:12,marginTop:4, lineHeight: 16, flexShrink: 1, },

    progressWrapper: { marginTop:16,width:'100%' },
    progressBg:      { flexDirection:'row',height:4,backgroundColor:'#333',borderRadius:2,overflow:'hidden' },
    progressFill:    { backgroundColor:'#1DB954' },
    progressRemain:  { backgroundColor:'transparent' },
    time:            { color:'#aaa',fontSize:10,textAlign:'right',marginTop:4 },
});
