import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    Platform,
    StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    MaterialIcons,
    MaterialCommunityIcons,
} from '@expo/vector-icons';
import api, {
    getPlaylist,
    removeTrackFromPlaylist,
    updatePlaylistMeta,
    reorderPlaylist,
    PlaylistDetail,
    TrackItem,
} from '../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavProp = NativeStackNavigationProp<
    RootStackParamList,
    'EditPlaylist'
>;

export default function EditPlaylistScreen() {
    const navigation = useNavigation<NavProp>();
    const { playlistId } = useRoute().params as { playlistId: number };

    const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
    const [loading, setLoading]   = useState(true);
    const [title, setTitle]       = useState('');

    // fetch playlist
    useEffect(() => {
        let alive = true;
        getPlaylist(playlistId)
            .then(pl => {
                if (!alive) return;
                setPlaylist(pl);
                setTitle(pl.title);
                // if your API returns description, load it here
            })
            .catch(console.warn)
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [playlistId]);

    if (loading || !playlist) {
        return <View style={styles.loader}><Text style={{color:'#fff'}}>Loading…</Text></View>;
    }

    const images = playlist.tracks.slice(0,4).map(t => api.getUri() + t.album_art);
    while (images.length < 4) images.push(''); // pad for placeholders

    const onSave = async () => {
        try {
            await updatePlaylistMeta(playlistId, { title });
            // optionally reorder, etc.
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Error saving changes');
        }
    };

    const onRemove = async (trackId: number) => {
        await removeTrackFromPlaylist(playlistId, trackId);
        const pl2 = await getPlaylist(playlistId);
        setPlaylist(pl2);
    };

    const renderTrack = ({ item, index }: { item: TrackItem; index: number }) => (
        <View style={styles.trackRow}>
            <TouchableOpacity onPress={() => onRemove(item.id)}>
                <MaterialIcons name="remove-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex:1, marginLeft:12 }}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackMeta}>{item.artist} • {item.album_art}</Text>
            </View>
            <MaterialCommunityIcons
                name="drag-vertical"
                size={24}
                color="#888"
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Edit Playlist</Text>
                <TouchableOpacity onPress={onSave}>
                    <Text style={styles.save}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.coverGrid}>
                {images.map((uri, i) => (
                    uri
                        ? <Image key={i} source={{ uri }} style={styles.coverImg} />
                        : <View key={i} style={[styles.coverImg, { backgroundColor:'#333' }]} />
                ))}
            </View>
            <TouchableOpacity style={styles.changeImg}>
                <Text style={styles.changeText}>Change image</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Playlist name"
                placeholderTextColor="#888"
            />

            <FlatList
                data={playlist.tracks}
                keyExtractor={t => t.id.toString()}
                renderItem={renderTrack}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex:1,
        backgroundColor:'#121212',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loader: {
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },

    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        padding:16,
    },
    cancel:{ color:'#888', fontSize:16 },
    title: { color:'#fff', fontSize:18, fontWeight:'600' },
    save:  { color:'#1DB954', fontSize:16, fontWeight:'600' },

    coverGrid: {
        flexDirection:'row',
        flexWrap:'wrap',
        marginHorizontal:16,
        borderRadius:8,
        overflow:'hidden',
    },
    coverImg: {
        width:'50%',
        aspectRatio:1,
    },
    changeImg: {
        alignSelf:'center',
        marginVertical:12,
    },
    changeText:{
        color:'#1DB954',
        fontSize:16,
        fontWeight:'500',
    },

    input: {
        marginHorizontal:16,
        borderBottomWidth:1,
        borderBottomColor:'#444',
        color:'#fff',
        fontSize:20,
        paddingVertical:8,
        marginTop:12,
    },

    descBtn: {
        alignSelf:'center',
        backgroundColor:'#282828',
        paddingHorizontal:16,
        paddingVertical:8,
        borderRadius:20,
        marginTop:12,
    },
    descBtnText:{
        color:'#fff',
        fontSize:14,
    },

    list: {
        padding:16,
        paddingBottom:80,
    },
    trackRow: {
        flexDirection:'row',
        alignItems:'center',
        paddingVertical:12,
    },
    trackTitle:{
        color:'#fff',
        fontSize:16,
    },
    trackMeta:{
        color:'#888',
        fontSize:12,
        marginTop:4,
    },
});
