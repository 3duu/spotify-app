import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import api, { getPlaylist } from '../services/api';
import Player from '../components/Player';

interface TrackItem {
    id:         string;
    title:      string;
    artist:     string;
    cover:      string;
    video:      boolean;
    downloaded: boolean;
}

interface PlaylistDetail {
    id:          string;
    title:       string;
    cover:       string;
    ownerName:   string;
    ownerImage:  string;
    duration:    string;       // e.g. "5h 59m"
    tracks:      TrackItem[];
}

export default function PlaylistScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { playlistId } = route.params as { playlistId: string };

    const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await getPlaylist(playlistId);
                if (!active) return;
                setPlaylist(data);
            } catch (err) {
                console.error(err);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false };
    }, [playlistId]);

    if (loading || !playlist) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    const { title, cover, ownerName, ownerImage, duration, tracks } = playlist;
    const screenWidth = Dimensions.get('window').width;

    const renderItem = ({ item }: { item: TrackItem }) => (
        <View style={styles.trackRow}>
            <Image
                source={{ uri: api.getUri() + item.cover }}
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
            <TouchableOpacity>
                <MaterialIcons name="more-horiz" size={24} color="#888" />
            </TouchableOpacity>
        </View>
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
                    style={[styles.coverArt, { width: screenWidth - 32, height: screenWidth - 32 }]}
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
                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.actionText}>Adicionar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="sort" size={20} color="#fff" />
                        <Text style={styles.actionText}>Classificar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="edit" size={20} color="#fff" />
                        <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Track list */}
            <FlatList
                data={tracks}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Player at bottom */}
            <Player />
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
    },
    coverArt: {
        borderRadius: 8,
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
        marginRight: 24,
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#282828',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    actionText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
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
        borderRadius: 4,
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
});
