import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import api, {
    getPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylist, PlaylistDetail, TrackItem,
} from '../services/api';
import {setQueue, setPlaying, setIndex} from '../store/slices/playerSlice';
import { useAppDispatch } from '../store';
import TrackMenu from "../components/TrackMenu";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../App";

export default function PlaylistScreen() {

    const dispatch = useAppDispatch();
    const route = useRoute<any>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { playlistId } = route.params as { playlistId: number };

    const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
    const [loading, setLoading]   = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<TrackItem | null>(null);

    // handler for the big header play button:
    const onPlayAll = () => {
        const ids = tracks.map(t => t.id);
        if (!ids.length) return;
        dispatch(setQueue(ids));
        dispatch(setPlaying());
    };

    const onSelectTrack = (idx: number) => {
    const ids = tracks.map(t => t.id);
        dispatch(setQueue(ids));
        dispatch(setIndex(idx));
        dispatch(setPlaying());
    };

    // 1) Add a track (opens prompt for demo)
    const onAddPress = async () => {
        const id : number = 0;
        if (!id) return;
        await addTrackToPlaylist(playlistId, id);
        const refreshed = await getPlaylist(playlistId);
        setPlaylist(refreshed);
    };

// 2) Remove a track (for demo we remove the last)
    const onRemoveLast = async () => {
        if (!playlist || playlist.tracks.length === 0) return;
        const lastId = playlist.tracks[playlist.tracks.length - 1].id;
        await removeTrackFromPlaylist(playlistId, lastId);
        setPlaylist(await getPlaylist(playlistId));
    };

  // 3) Rename / Edit meta
    const onEditPress = () => {
        navigation.navigate('EditPlaylist', { playlistId });
    };

// 4) Reorder (demo: reverse order)
    const onSortPress = async () => {
        if (!playlist) return;
        const ids = playlist.tracks.map(t => t.id).reverse();
        await reorderPlaylist(playlistId, ids);
        setPlaylist(await getPlaylist(playlistId));
    };

    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            const pl = await getPlaylist(playlistId);
            setPlaylist(pl);
        } catch (e) {
            console.warn(e);
        } finally {
            setLoading(false);
        }
    }, [playlistId]);

    useEffect(() => {
        load();
    }, [load]);

    useFocusEffect(
        React.useCallback(() => {
            load();
        }, [load])
    );

    if (loading || !playlist) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    const { title, cover, ownerName, ownerImage, duration, tracks } = playlist;

    const renderItem = ({ item, index }: { item: TrackItem; index: number }) => (
        <TouchableOpacity
          onPress={() => onSelectTrack(index)}
              style={styles.trackRow}>
            <Image
                source={{ uri: api.getUri() + item.album_art }}
                style={styles.trackArt}
            />
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <View style={styles.trackMeta}>
                    {item.downloaded && (
                        <MaterialIcons
                            name="download"
                            size={16}
                            color="#1DB954"
                            style={{ marginRight: 4 }}
                        />
                    )}
                    {item.video && (
                        <MaterialCommunityIcons
                            name="video-outline"
                            size={16}
                            color="#fff"
                            style={{ marginRight: 4 }}
                        />
                    )}
                    <Text style={styles.trackArtist} numberOfLines={1}>
                        {item.artist}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => {
                setSelectedTrack(item);
                setMenuVisible(true);
            }}>
                <MaterialIcons name="more-horiz" size={24} color="#888" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {title}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Cover + meta */}
            <View style={styles.coverContainer}>
                <Image
                    source={{ uri: api.getUri() + cover }}
                    style={[styles.coverArt]}
                />

                <View style={styles.metaRow}>
                    <Image source={{ uri: ownerImage }} style={styles.ownerAvatar} />
                    <Text style={styles.ownerName}>{ownerName}</Text>

                    <MaterialCommunityIcons
                        name="web"
                        size={16}
                        color="#aaa"
                        style={{ marginLeft: 16 }}
                    />
                    <Text style={styles.durationText}>{duration}</Text>
                </View>

                {/* Action icons */}
                <View style={styles.iconRow}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="file-download" size={24} color="#1DB954" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="person-add" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="more-horiz" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Buttons: Add / Sort / Edit */}
                <View style={styles.buttonRow}>
                   <TouchableOpacity style={styles.actionButton} onPress={onAddPress}>
                       <MaterialIcons name="add" size={20} color="#fff" />
                       <Text style={styles.actionText}>Add</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.actionButton} onPress={onSortPress}>
                       <MaterialIcons name="sort" size={20} color="#fff" />
                       <Text style={styles.actionText}>Sort</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.actionButton} onPress={onEditPress}>
                       <MaterialIcons name="edit" size={20} color="#fff" />
                       <Text style={styles.actionText}>Edit</Text>
                   </TouchableOpacity>
                    {/* big play-all button */}
                    <TouchableOpacity style={styles.playAllBtn} onPress={onPlayAll}>
                        <MaterialIcons name="play-arrow" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Track list */}
            <FlatList
                data={tracks}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {selectedTrack && (
                <TrackMenu
                    isVisible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    track={{
                        id: selectedTrack.id,
                        title: selectedTrack.title,
                        artist: selectedTrack.artist,
                        //album_id: selectedTrack.album_id,
                        //artist_id: selectedTrack.artist_id,
                        album_art: selectedTrack.album_art,
                    }}
                    playlistId={playlist.id}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loader: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    coverContainer: {
       paddingHorizontal: 16,
       marginBottom: 16,
       alignItems: 'center',
    },
    coverArt: {
      width: 200,
      height: 200,
      //borderRadius: 8,
      marginBottom: 12,
      backgroundColor: '#333',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ownerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    ownerName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    durationText: {
        color: '#aaa',
        fontSize: 12,
        marginLeft: 4,
    },
    iconRow: {
        flexDirection: 'row',
       alignItems: 'center',
       marginBottom: 12,
    },
    iconBtn: {
        marginRight: 28,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#282828',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    actionText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 13,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 90, // leave room for Player
    },
    trackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    trackArt: {
        width: 48,
        height: 48,
        //borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#333',
    },
    trackInfo: {
        flex: 1,
    },
    trackTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    trackMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    trackArtist: {
        color: '#aaa',
        fontSize: 12,
    },
    playAllBtn: {
        backgroundColor: '#1DB954',
        borderRadius: 24,
        padding: 8,
        marginLeft: 8,
    },
});
