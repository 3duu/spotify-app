import React, { useEffect, useCallback, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Platform,
    StatusBar,
} from 'react-native';
import {useRoute, useNavigation, useFocusEffect, RouteProp} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import api, {
    getPlaylist,
    getAlbum,
    getArtist,
    getPodcast,
    PlaylistDetail,
    TrackItem,
} from '../services/api';
import { setQueue, setPlaying, setIndex } from '../store/slices/playerSlice';
import { useAppDispatch } from '../store';
import TrackMenu from '../components/TrackMenu';
import type { RootStackParamList } from '../../App';

export type TrackListMode = 'playlist' | 'album' | 'artist' | 'podcast';

type RouteProps = {
    TrackList: { mode: TrackListMode; id: number };
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'TrackList'>;

export default function TrackListScreen() {
    const dispatch = useAppDispatch();
    const route    = useRoute<RouteProp<RouteProps, 'TrackList'>>();
    const navigation = useNavigation<NavProp>();
    const { mode, id } = route.params;

    const [detail, setDetail] = useState<PlaylistDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [sel, setSel] = useState<TrackItem | null>(null);

    // fetcher
    const load = useCallback(async () => {
        setLoading(true);
        try {
            let data: PlaylistDetail;
            if (mode === 'playlist') data = await getPlaylist(id);
            else if (mode === 'album') data = await getAlbum(id);
            else if (mode === 'artist') data = await getArtist(id);
            else if (mode === 'podcast') data = await getPodcast(id); // assuming podcasts are treated like artists
            else data = await getPlaylist(id);
            setDetail(data);
        } finally {
            setLoading(false);
        }
    }, [mode, id]);

    useEffect(() => { load(); }, [load]);
    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (loading || !detail) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    const { title, cover, ownerName, ownerImage, duration, tracks } = detail;

    const playAll = () => {
        const ids = tracks.map(t => t.id);
        if (ids.length === 0) return;
        dispatch(setQueue(ids));
        dispatch(setPlaying());
    };

    const selectTrack = (idx: number) => {
        const ids = tracks.map(t => t.id);
        dispatch(setQueue(ids));
        dispatch(setIndex(idx));
        dispatch(setPlaying());
    };

    const renderItem = ({ item, index }: { item: TrackItem; index: number }) => (
        <TouchableOpacity
            style={styles.trackRow}
            onPress={() => selectTrack(index)}
        >
            <Image
                source={{ uri: api.getUri() + item.album_art }}
                style={styles.trackArt}
            />
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.trackMeta}>
                    {item.downloaded && <MaterialIcons name="download" size={16} color="#1DB954" style={{marginRight:4}} />}
                    {item.video    && <MaterialCommunityIcons name="video-outline" size={16} color="#fff" style={{marginRight:4}} />}
                    <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => { setSel(item); setMenuVisible(true); }}>
                <MaterialIcons name="more-horiz" size={24} color="#888" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* ← back + title */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* cover + meta */}
            <View style={styles.coverContainer}>
                <Image source={{ uri: api.getUri() + cover }} style={styles.coverArt} />
                <View style={styles.metaRow}>
                    <Image source={{ uri: ownerImage }} style={styles.ownerAvatar} />
                    <Text style={styles.ownerName}>{ownerName}</Text>
                    <MaterialCommunityIcons name="web" size={16} color="#aaa" style={{marginLeft:16}}/>
                    <Text style={styles.durationText}>{duration}</Text>
                </View>

                {/* play-all */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.playAllBtn} onPress={playAll}>
                        <MaterialIcons name="play-arrow" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* track list */}
            <FlatList
                data={tracks}
                keyExtractor={t => t.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* shared track menu */}
            {sel && (
                <TrackMenu
                    isVisible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    track={{
                        id: sel.id,
                        title: sel.title,
                        artist: sel.artist,
                        album_art: sel.album_art
                    }}
                    playlistId={mode === 'playlist' ? id : undefined}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex:1, backgroundColor:'#121212', paddingTop: Platform.OS==='android'?StatusBar.currentHeight:0 },
    loader: { flex:1, justifyContent:'center',alignItems:'center', backgroundColor:'#121212' },
    header:{ flexDirection:'row', alignItems:'center', padding:16, justifyContent:'space-between' },
    headerTitle:{ color:'#fff', fontSize:20, fontWeight:'bold', flex:1, textAlign:'center' },
    coverContainer:{ paddingHorizontal:16, marginBottom:16, alignItems:'center' },
    coverArt:{ width:200, height:200, backgroundColor:'#333', marginBottom:12 },
    metaRow:{ flexDirection:'row', alignItems:'center', marginBottom:12 },
    ownerAvatar:{ width:24, height:24, borderRadius:12, marginRight:8 },
    ownerName:{ color:'#fff', fontSize:14, fontWeight:'600' },
    durationText:{ color:'#aaa', fontSize:12, marginLeft:4 },
    buttonRow:{ flexDirection:'row', justifyContent:'flex-end', width:'100%' },
    playAllBtn:{ backgroundColor:'#1DB954', borderRadius:24, padding:8 },
    list:{ paddingHorizontal:16, paddingBottom:90 },
    trackRow:{ flexDirection:'row', alignItems:'center', marginBottom:16 },
    trackArt:{ width:48, height:48, backgroundColor:'#333', marginRight:12 },
    trackInfo:{ flex:1 },
    trackTitle:{ color:'#fff', fontSize:16, fontWeight:'500' },
    trackMeta:{ flexDirection:'row', alignItems:'center', marginTop:4 },
    trackArtist:{ color:'#aaa', fontSize:12 },
});
