import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform, StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';
import type { PlaylistResponse } from '../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {RootStackParamList} from "../../App";
import Toast from "react-native-toast-message";

type AddNavProp = NativeStackNavigationProp<RootStackParamList, 'AddToPlaylist'>;

export default function AddToPlaylistScreen() {
    const route = useRoute();
    const navigation = useNavigation<AddNavProp>();
    const { trackId } = route.params as { trackId: number };

    const [all, setAll] = useState<PlaylistResponse[]>([]);
    const [filtered, setFiltered] = useState<PlaylistResponse[]>([]);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    // fetch playlists on mount
    useEffect(() => {
        api.get('/library') // assumes GET /library returns { playlists: PlaylistResponse[] }
            .then(res => {
                setAll(res.data.playlists);
                setFiltered(res.data.playlists);
            })
            .catch(err => {
                console.error(err);
                Toast.show({type: 'error', text1: 'Error', text2: 'Error loading playlists'});
            })
            .finally(() => setLoading(false));
    }, []);

    // filter as user types
    function onChangeSearch(text: string) {
        setSearch(text);
        const q = text.toLowerCase();
        setFiltered(all.filter(pl => pl.title.toLowerCase().includes(q)));
    }

    // toggle selection
    function toggle(id: number) {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    }

    // call API to add this track to every selected playlist
    async function onDone() {
        if (selectedIds.size === 0) return navigation.goBack();
        try {
            for (let pid of selectedIds) {
                await api.post(`/playlists/${pid}/tracks`, { track_id: +trackId });
            }
            Toast.show({type: 'success', text1: 'Success', text2: `Added to ${selectedIds.size} playlist${selectedIds.size > 1 ? 's' : ''}`});
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Toast.show({type: 'error', text1: 'Error', text2: 'Failed to add track to playlists'});
        }
    }

    // stub for creating a new playlist
    function onNewPlaylist() {
        // you can navigate to your CreatePlaylist screen here
        navigation.navigate('CreatePlaylist', { trackId });
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Add to Playlist</Text>
                <TouchableOpacity onPress={onNewPlaylist}>
                    <Text style={styles.new}>New</Text>
                </TouchableOpacity>
            </View>

            {/* search */}
            <TextInput
                style={styles.search}
                placeholder="Find a playlist"
                placeholderTextColor="#888"
                value={search}
                onChangeText={onChangeSearch}
            />

            {/* list */}
            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#fff" />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        const isSel = selectedIds.has(item.id);
                        return (
                            <TouchableOpacity style={styles.row} onPress={() => toggle(item.id)}>
                                <Image
                                    source={{ uri: api.getUri() + item.cover }}
                                    style={styles.art}
                                />
                                <View style={styles.info}>
                                    <Text style={styles.plTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.plSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                </View>
                                <MaterialIcons
                                    name={isSel ? "radio-button-checked" : "radio-button-unchecked"}
                                    size={24}
                                    color={isSel ? "#1DB954" : "#888"}
                                />
                            </TouchableOpacity>
                        );
                    }}
                    ItemSeparatorComponent={() => <View style={styles.sep} />}
                />
            )}

            {/* done button */}
            <TouchableOpacity
                style={[
                    styles.doneBtn,
                    { backgroundColor: selectedIds.size ? '#1DB954' : '#555' }
                ]}
                onPress={onDone}
                disabled={selectedIds.size === 0}
            >
                <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    cancel: {
        color: '#888',
        fontSize: 16,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    new: {
        color: '#1DB954',
        fontSize: 16,
        fontWeight: '600',
    },
    search: {
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#282828',
        color: '#fff',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 80, // space for Done button
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    art: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: '#333',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    plTitle: {
        color: '#fff',
        fontSize: 16,
    },
    plSubtitle: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    sep: {
        height: 1,
        backgroundColor: '#2a2a2a',
    },
    doneBtn: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
