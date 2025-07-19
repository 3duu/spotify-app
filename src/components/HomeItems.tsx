import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import api, {
    getRecentPlaylists,
    Newsletter,
    getNewsletters,
    TrackMeta,
    LibraryData,
    getRecentTracks,
    getLibraryData, Album, RecentItemResponse
} from '../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../../App";

type ModeUnion = 'playlist'|'album'|'artist'|'podcast';

function normalizeMode(raw: string): ModeUnion {
    switch(raw.toUpperCase()) {
        case 'PLAYLIST': return 'playlist';
        case 'ALBUM':    return 'album';
        case 'ARTIST':   return 'artist';
        case 'PODCAST':  return 'podcast';
        default:
            console.warn(`Unknown mode "${raw}", defaulting to "playlist"`);
            return 'playlist';
    }
}

const categoryTabs = ['All', 'Songs', 'Podcasts'] as const
type CategoryTab = typeof categoryTabs[number];

export default function HomeItems() {
    
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab]         = useState('All');
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [recentPlayed, setRecentPlayed] = useState<RecentItemResponse[]>([]);
    const [tracks, setTracks] = useState<TrackMeta[]>([]);
    const [library, setLibrary] = useState<LibraryData | null>(null);

    useEffect(() => {
        // just load the newsletters once
        getNewsletters()
            .then(data => setNewsletters(data))
            .catch(err => console.error('Failed to load newsletters:', err));
    }, []);

    useEffect(() => {
        // Load playlists when the component mounts
        getRecentPlaylists(1) // replace with actual user ID if needed
            .then(data => setRecentPlayed(data))
            .catch(err => console.error('Failed to load playlists:', err));
    }, []);

    // load recent tracks for "Songs"
    useEffect(() => {
        getRecentTracks()
            .then(data => setTracks(data))
            .catch(err => console.error('Failed to load tracks:', err));
    }, []);

// load library data for "Podcasts"
    useEffect(() => {
        getLibraryData()
            .then(data => setLibrary(data))
            .catch(err => console.error('Failed to load library:', err));
    }, []);


    // Fetch data here (same as before)

    return (
        <ScrollView style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {categoryTabs.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Recent played Section */}
            <View style={smallStyles.gridContainer}>
                {Array.from({ length: Math.ceil(recentPlayed.length / 2) }).map((_, rowIdx) => {
                    const first = recentPlayed[rowIdx * 2];
                    const second = recentPlayed[rowIdx * 2 + 1];
                    return (
                        <View style={smallStyles.row} key={rowIdx}>
                            {first && (
                                <TouchableOpacity
                                    style={smallStyles.gridCard}
                                    onPress={() =>
                                        navigation.navigate('TrackList', {
                                            id: first.id,
                                            title: first.title,
                                            mode: 'playlist',
                                        })
                                    }
                                >
                                    {first.cover ? (
                                        <Image source={{ uri: api.getUri() + first.cover }} style={smallStyles.gridCardImage} />
                                    ) : (
                                        <View style={smallStyles.gridCardPlaceholder} />
                                    )}
                                    <Text style={smallStyles.gridCardTitle} numberOfLines={1}>
                                        {first.subtitle}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {second && (
                                <TouchableOpacity
                                    style={smallStyles.gridCard}
                                    onPress={() =>
                                        navigation.navigate('TrackList', {
                                            id: second.id,
                                            title: second.title,
                                            mode: 'playlist',
                                        })
                                    }
                                >
                                    {second.cover ? (
                                        <Image source={{ uri: api.getUri() + second.cover }} style={smallStyles.gridCardImage} />
                                    ) : (
                                        <View style={smallStyles.gridCardPlaceholder} />
                                    )}
                                    <Text style={smallStyles.gridCardTitle} numberOfLines={1}>
                                        {second.subtitle}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>

            {activeTab === 'All' && (
                <>
                    {/* Newsletter Section */}
                    <Text style={styles.sectionHeader}>Chosen for you</Text>
                    <View style={styles.gridContainer}>
                        {newsletters.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('TrackList', { id: item.item_id, title: item.title, mode: normalizeMode(item.type) })}
                            >
                                {item.image ? (
                                    <Image source={{ uri: api.getUri() + item.image }} style={styles.cardImage} />
                                ) : (
                                    <View style={styles.placeholder} />
                                )}
                                <Text style={styles.featuredTitle} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                {item.content && (
                                    <Text style={styles.featuredSubtitle} numberOfLines={1}>
                                        {item.content}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {activeTab === 'Songs' && (
                <>
                    <Text style={styles.sectionHeader}>Your Songs</Text>
                    <View style={styles.gridContainer}>
                        {tracks.map(track => (
                            <TouchableOpacity
                                key={track.id}
                                style={styles.card}
                                onPress={() =>
                                    navigation.navigate('TrackList', {
                                        id: track.id,
                                        title: track.title,
                                        mode: 'playlist'   // or 'artist' / adjust as you wish
                                    })
                                }
                            >
                                {track.album_art ? (
                                    <Image
                                        source={{ uri: api.getUri() + track.album_art }}
                                        style={styles.cardImage}
                                    />
                                ) : (
                                    <View style={styles.placeholder} />
                                )}
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {track.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* ------ PODCASTS ------ */}
            {activeTab === 'Podcasts' && library && (
                <>
                    <Text style={styles.sectionHeader}>Your Podcasts</Text>
                    <View style={styles.gridContainer}>
                        {library.podcasts.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={styles.card}
                                onPress={() =>
                                    navigation.navigate('TrackList', {
                                        id: p.id,
                                        title: p.title,
                                        mode: 'podcast'
                                    })
                                }
                            >
                                {p.cover ? (
                                    <Image
                                        source={{ uri: api.getUri() + p.cover }}
                                        style={styles.cardImage}
                                    />
                                ) : (
                                    <View style={styles.placeholder} />
                                )}
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {p.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#333',
        borderRadius: 20,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#1DB954',
        borderRadius: 20,
    },
    tabText: {
        color: '#fff',
        fontSize: 14,
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    sectionHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: { width: '48%', marginBottom: 16, borderRadius: 4 },
    cardImage: { width: '100%', aspectRatio: 1 },
    cardTitle: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
    cardMini: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 4,
    },
    cardImageMini: {
        width: '100%',
        height: 140,
        marginBottom: 6,
    },
    cardTitleMini: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
    featuredTitle: {
        color: '#fff',
        fontSize: 16,
        marginTop: 8,
    },
    featuredSubtitle: {
        color: '#fff',
        fontSize: 10,
        marginTop: 4,
    },
    banner: {
        width: '100%',
        height: 120,
        marginBottom: 16,
    },
    bannerSubtitle: {
        paddingHorizontal: 16,
        color: 'white',
        fontSize: 14,
        marginBottom: 20,
    },
    albumCard: {
        width: 140,
        marginRight: 16,
    },
    albumImage: {
        width: 140,
        height: 140,
        marginBottom: 6,
    },
    albumTitle: {
        color: 'white',
        fontSize: 14,
    },
    placeholder: {

    }
});

const smallStyles = StyleSheet.create({
    // ...other styles...
    sectionHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 16,
    },
    gridContainer: {
        marginHorizontal: 0,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    gridCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 4,
        padding: 8,
        marginRight: 8,
        minHeight: 54,
        maxHeight: 64,
    },
    // Last card in the row should not have right margin
    gridCardLast: {
        marginRight: 0,
    },
    gridCardImage: {
        width: 48,
        height: 48,
        borderRadius: 2,
        marginRight: 10,
        backgroundColor: '#444',
    },
    gridCardPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 6,
        marginRight: 10,
        backgroundColor: '#333',
    },
    gridCardTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        flex: 1,
        flexShrink: 1,
    },
});

