import React, {ComponentProps, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView, Platform, Share
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import api, { getTrack, TrackMeta } from '../services/api';
import { player } from '../services/audioPlayer';
import { FlatList } from 'react-native-gesture-handler';
import RNModal from 'react-native-modal';
import {useAppDispatch, useAppSelector} from "../store";
import {setQueue} from "../store/slices/playerSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../App";

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type Props = NativeStackScreenProps<RootStackParamList, 'TrackDetails'>;

interface MenuOption {
    icon: MaterialIconName;
    label: string;
    onPress: () => void;
}

export default function TrackDetails({ navigation, route }: any) {
    const { id } = route.params as { id: number };

    // ── 1) All your useState hooks first ─────────────────────────
    const [track,    setTrack]    = useState<TrackMeta | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [playing,  setPlaying]  = useState(false);
    const [deviceName, setDeviceName] = useState('Phone speaker');
    const [shuffle,  setShuffle]  = useState(false);
    const [repeat,   setRepeat]   = useState(false);
    const dispatch = useAppDispatch();
    const queue    = useAppSelector(s => s.player.queue);

     // ─── menu state ───────────────────────────
    const [menuVisible, setMenuVisible] = useState(false);

    // stub handlers – wire these up to real logic as needed:
    const onAddToPlaylist      = () => { /* TODO */ setMenuVisible(false); };
    const onRemoveFromPlaylist = () => { /* TODO */ setMenuVisible(false); };
    const onAddToQueue = () => {
        dispatch(setQueue([...queue, id]));
        //dispatch(setPlaying());
        setMenuVisible(false);
    };
    const onOpenQueue          = () => { /* TODO */ setMenuVisible(false); };
    const onShareTrack         = async () => {
        try {
             await Share.share({
                   message: `${track?.title} by ${track?.artist} – ${api.getUri()}/tracks/${id}`
             });
    } catch {}
    setMenuVisible(false);
    };
    const onGoToAlbum          = () => navigation.navigate('Album', { id: track?.album_id }) && setMenuVisible(false);
    const onGoToArtist         = () => navigation.navigate('Artist', { id: track?.artist_id }) && setMenuVisible(false);

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

    {/* menu options */}

    const menuItems: MenuOption[] = [
        { icon: 'playlist-add',            label: 'Add to Playlist',             onPress: onAddToPlaylist },
        { icon: 'remove-circle-outline',   label: 'Remove from Playlist',        onPress: onRemoveFromPlaylist },
        { icon: 'playlist-play',           label: 'Add to Queue',                onPress: onAddToQueue },
        { icon: 'queue-music',             label: 'Open Queue',                  onPress: onOpenQueue },
        { icon: 'share',                   label: 'Share',                       onPress: onShareTrack },
        { icon: 'album',                   label: 'Go to Album',                 onPress: onGoToAlbum },
        { icon: 'person',                  label: 'Go to Artist',                onPress: onGoToArtist },
    ];

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
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
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


             {/* ── MENU BOTTOM SHEET ─────────────────────────── */}
             <RNModal
               isVisible={menuVisible}
               onBackdropPress={() => setMenuVisible(false)}
               style={styles.modal}
               swipeDirection="down"
               onSwipeComplete={() => setMenuVisible(false)}
             >
               <View style={styles.menuContainer}>
                 {/* header drag handle */}
                 <View style={styles.menuHandle}/>
                 {/* track info */}
                 <View style={styles.menuHeader}>
                   <Image
                     source={{ uri: api.getUri() + track.album_art }}
                     style={styles.menuArt}
                   />
                   <View style={{marginLeft:12, flex:1}}>
                     <Text style={styles.menuTitle} numberOfLines={1}>{track.title}</Text>
                     <Text style={styles.menuSubtitle}>{track.artist}</Text>
                   </View>
                 </View>


                <FlatList
                      data={menuItems}
                   keyExtractor={(item) => item.label}
                   renderItem={({item}) => (
                     <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                       <MaterialIcons name={item.icon} size={20} color="#fff" />
                       <Text style={styles.menuLabel}>{item.label}</Text>
                     </TouchableOpacity>
                   )}
                />
               </View>
             </RNModal>

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
        width:300, height:300, marginBottom:16
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
    },
    menuHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    menuArt: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: '#333',
    },
    menuTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    menuSubtitle: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    menuLabel: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 16,
    },
    modal: { justifyContent: 'flex-end', margin:0 },
    menuContainer: {
        backgroundColor: '#121212',
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 32,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
});
