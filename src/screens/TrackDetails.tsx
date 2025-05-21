import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView, Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import api, { getTrack, TrackMeta } from '../services/api';
import { player } from '../services/audioPlayer';

export default function TrackDetails({ navigation, route }: any) {
    const { id } = route.params as { id: string };

    // ── 1) All your useState hooks first ─────────────────────────
    const [track,    setTrack]    = useState<TrackMeta | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [playing,  setPlaying]  = useState(false);
    const [deviceName, setDeviceName] = useState('Phone speaker');
    const [shuffle,  setShuffle]  = useState(false);
    const [repeat,   setRepeat]   = useState(false);

    // handlers
    const onShufflePress = () => setShuffle(s => !s);
    const onPrevPress    = () => {
        const newPos = Math.max(0, position - 15);
        player.seekTo(newPos);
        setPosition(newPos);
    };
    const onNextPress    = () => {
        const newPos = Math.min(duration, position + 15);
        player.seekTo(newPos);
        setPosition(newPos);
    };
    const onRepeatPress  = () => setRepeat(r => !r);
    const onPlayPause    = () => {
        player.playing ? player.pause() : player.play();
    };

    // format mm:ss
    const fmt = (s: number) => {
        const m = Math.floor(s/60).toString().padStart(2,'0');
        const ss= Math.floor(s%60).toString().padStart(2,'0');
        return `${m}:${ss}`;
    };

    // ── 2) All your useEffect hooks next ─────────────────────────
    // 2a) fetch track metadata
    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            const data = await getTrack(id);
            if (!active) return;
            setTrack(data);
            setDuration(data.duration);
            setLoading(false);
        })().catch(console.warn);
        return () => { active = false; };
    }, [id]);

    // 2b) poll the shared player for position/duration/playing
    useEffect(() => {
        const iv = setInterval(() => {
            setPosition(player.currentTime);
            setDuration(player.duration   ?? duration);
            setPlaying (player.playing    ?? playing);
        }, 300);
        return () => clearInterval(iv);
    }, [player, duration]);

    // 2c) detect the output device (once)
    useEffect(() => {
        if (Platform.OS === 'web' && navigator.mediaDevices?.enumerateDevices) {
            navigator.mediaDevices
                .enumerateDevices()
                .then(devs => {
                    const audioOut = devs.find(d => d.kind === 'audiooutput');
                    if (audioOut?.label) setDeviceName(audioOut.label);
                })
                .catch(() => {});
        }
    }, []);

    // ── 3) Now you can do your early return ───────────────────────
    if (loading || !track) {
        return (
            <SafeAreaView style={[styles.loader, { backgroundColor: track?.color ?? '#000' }]}>
                <ActivityIndicator size="large" color="#fff" />
            </SafeAreaView>
        );
    }

    const remaining = duration - position;

    if (loading || !track) {
        return (
            <SafeAreaView style={[styles.loader, { backgroundColor: track?.color ?? '#052c2c' }]}>
                <ActivityIndicator size="large" color="#fff"/>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: track.color }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {track.title}
                </Text>
                <TouchableOpacity onPress={() => {/* overflow */}}>
                    <MaterialIcons name="more-vert" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Album Art */}
                <Image
                    source={{ uri: api.getUri() + (track.album_art ?? '') }}
                    style={styles.albumArt}
                />

                {/* Switch to video */}
                {/*<TouchableOpacity style={styles.switchButton}>
                    <MaterialIcons name="videocam" size={20} color="#fff" />
                    <Text style={styles.switchText}>Switch to video</Text>
                </TouchableOpacity>*/}

                {/* Title & Artist */}
                <View style={styles.infoRow}>
                    <View style={{ flex: 1 , top: 12}}>
                        <Text style={styles.titleText}>{track.title}</Text>
                        <Text style={styles.artistText}>{track.artist}</Text>
                    </View>
                    <MaterialIcons name="check-circle" size={24} color="#1DB954" />
                </View>

                {/* Progress Slider */}
                <View style={styles.progressContainer}>
                    <Text style={styles.timeStamp}>{fmt(position)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        minimumTrackTintColor="#fff"
                        maximumTrackTintColor="#888"
                        thumbTintColor="#fff"
                        onSlidingComplete={val => {
                            player.seekTo(val).catch(console.error);
                            setPosition(val);
                        }}
                    />
                    <Text style={styles.timeStamp}>-{fmt(remaining)}</Text>
                </View>

                {/* Playback Controls */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity onPress={onShufflePress}>
                        <MaterialIcons
                            name="shuffle"
                            size={24}
                            color={shuffle ? '#1DB954' : '#fff'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onPrevPress}>
                        <MaterialIcons name="skip-previous" size={36} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onPlayPause}>
                        <MaterialIcons
                            name={playing ? 'pause' : 'play-arrow'}
                            size={32}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onNextPress}>
                        <MaterialIcons name="skip-next" size={36} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onRepeatPress}>
                        <MaterialIcons
                            name="repeat"
                            size={24}
                            color={repeat ? '#1DB954' : '#fff'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Device / Share / Queue */}
                <View style={styles.bottomRow}>
                    <MaterialCommunityIcons name="cast" size={20} color="#1DB954" />
                    <Text style={styles.deviceText}>{deviceName}</Text>
                    <TouchableOpacity style={styles.bottomIcon}>
                        <MaterialIcons name="share" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomIcon}>
                        <MaterialIcons name="queue-music" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Lyrics */}
                {/*<TouchableOpacity style={styles.lyricsButton}>
                    <MaterialIcons name="library-music" size={20} color="#fff" />
                    <Text style={styles.lyricsText}>Lyrics</Text>
                </TouchableOpacity>*/}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#4e2b2b' },
    loader: { flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#4e2b2b' },

    header: {
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingHorizontal:16,
        height:56,
        backgroundColor:'rgba(0,0,0,0.3)'
    },
    headerTitle: {
        color:'#fff', fontSize:16, fontWeight:'600', flex:1, textAlign:'center', marginHorizontal:40
    },

    scroll: {
        padding:16,
        alignItems:'center'
    },
    albumArt: {
        width:300, height:300, borderRadius:8, marginBottom:16
    },
    switchButton: {
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.4)',
        paddingVertical:6,
        paddingHorizontal:12,
        borderRadius:20,
        marginBottom:24
    },
    switchText: {
        color:'#fff', fontSize:14, marginLeft:8
    },

    infoRow: {
        flexDirection:'row',
        alignItems:'center',
        width:'100%',
        marginBottom:16
    },
    titleText: {
        color:'#fff', fontSize:20, fontWeight:'bold'
    },
    artistText: {
        color:'#ddd', fontSize:14, marginTop:4
    },

    progressContainer: {
        flexDirection:'row',
        alignItems:'center',
        width:'100%'
    },
    timeStamp: {
        color:'#ddd', fontSize:12, width:40, textAlign:'center'
    },
    slider: {
        flex:1,
        height:40
    },

    controlsRow: {
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around',
        width:'100%',
        marginVertical:24
    },
    playButtonLarge: {
        backgroundColor:'#1DB954',
        borderRadius:48,
        padding:12
    },

    bottomRow: {
        flexDirection:'row',
        alignItems:'center',
        width:'100%',
        justifyContent:'flex-start'
    },
    deviceText: {
        color:'#1DB954', fontSize:14, marginLeft:8, flex:1
    },
    bottomIcon: {
        marginLeft:16
    },

    lyricsButton: {
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.4)',
        paddingVertical:8,
        paddingHorizontal:16,
        borderRadius:20,
        marginTop:32
    },
    lyricsText: {
        color:'#fff', fontSize:14, marginLeft:8
    }
});
