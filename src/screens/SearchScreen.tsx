import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SectionList,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api, {
    search,
    SearchResults,
    TrackMeta,
    Artist,
    Album,
    PlaylistResponse,
    getRecommendations,
} from '../services/api';
import { useAppDispatch } from '../store';
import { setPlaying, setQueue } from '../store/slices/playerSlice';
import Body from '../components/Body';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type SectionItem = TrackMeta | Artist | Album | PlaylistResponse;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
    const navigation = useNavigation<NavProp>();
    const dispatch = useAppDispatch();

    // Search‐query state + debounce ref
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // “Discover something new” recommendations
    const [recommendations, setRecommendations] = useState<TrackMeta[]>([]);
    const [loadingRecs, setLoadingRecs] = useState<boolean>(false);

    // 1) Debounced search: run 500ms after user stops typing
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!query.trim()) {
            setResults(null);
            return;
        }

        debounceRef.current = setTimeout(() => {
            setLoadingSearch(true);
            search(query.trim())
                .then((res) => setResults(res))
                .catch((err) => console.error('Search error:', err))
                .finally(() => setLoadingSearch(false));
        }, 500);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    // “Submit” button: run search immediately
    const onSubmit = useCallback(() => {
        if (!query.trim()) return;
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        setLoadingSearch(true);
        search(query.trim())
            .then((res) => setResults(res))
            .catch((err) => console.error('Search error:', err))
            .finally(() => setLoadingSearch(false));
    }, [query]);

    // 2) Fetch recommendations once when screen mounts (and on focus)
    const loadRecs = useCallback(async () => {
        setLoadingRecs(true);
        try {
            const recs = await getRecommendations();
            setRecommendations(recs);
        } catch (err) {
            console.warn('Failed to load recommendations:', err);
        } finally {
            setLoadingRecs(false);
        }
    }, []);

    useEffect(() => {
        loadRecs();
    }, [loadRecs]);

    useFocusEffect(
        useCallback(() => {
            loadRecs();
        }, [loadRecs])
    );

    // 3) Render functions for each result type
    function renderTrack({ item }: { item: TrackMeta }) {
        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                    dispatch(setQueue([item.id]));
                    dispatch(setPlaying());
                }}
            >
                <Image
                    source={{ uri: api.getUri() + item.album_art }}
                    style={styles.resultImage}
                />
                <View style={styles.resultText}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultSubtitle}>{item.artist}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    function renderArtist({ item }: { item: Artist }) {
        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                    navigation.navigate('TrackList', {
                        id: item.artist_id,
                        mode: 'artist',
                    });
                }}
            >
                <Image
                    source={{ uri: api.getUri() + item.image }}
                    style={styles.resultImage}
                />
                <Text style={styles.resultTitle}>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    function renderAlbum({ item }: { item: Album }) {
        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                    navigation.navigate('TrackList', {
                        id: item.album_id,
                        mode: 'album',
                    });
                }}
            >
                <Image
                    source={{ uri: api.getUri() + item.cover }}
                    style={styles.resultImage}
                />
                <View style={styles.resultText}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultSubtitle}>{item.artist}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    function renderPlaylist({ item }: { item: PlaylistResponse }) {
        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                    navigation.navigate('TrackList', {
                        id: item.id,
                        mode: 'playlist',
                    });
                }}
            >
                <Image
                    source={{ uri: api.getUri() + item.cover }}
                    style={styles.resultImage}
                />
                <Text style={styles.resultTitle}>{item.title}</Text>
            </TouchableOpacity>
        );
    }

    // Build `sections` only when results exist
    const sectionsData: Array<{ title: string; data: SectionItem[] }> = results
        ? [
            { title: 'Tracks', data: results.tracks },
            { title: 'Artists', data: results.artists },
            { title: 'Albums', data: results.albums },
            { title: 'Playlists', data: results.playlists },
        ]
        : [];

    // 4) Render “recommendation card” (same style as suggestion cards)
    function renderRecommendationCard({ item }: { item: TrackMeta }) {
        return (
            <TouchableOpacity
                style={styles.suggestionCard}
                onPress={() => {
                    navigation.navigate('TrackDetails', {
                        id: item.id,
                        audio: item,
                        origin: 'search',
                        playlistId: undefined,
                    });
                }}
            >
                <Image
                    source={{ uri: api.getUri() + item.album_art }}
                    style={styles.suggestionImage}
                />
                <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.title}
                </Text>
            </TouchableOpacity>
        );
    }

    // 5) Static “tags” and “sectionsGrid” – you can replace these with dynamic calls later
    const tags = [
        { id: 'metal', label: '#metal' },
        { id: 'trancecore', label: '#trancecore' },
        { id: 'pop', label: '#pop' },
    ];

    const sectionsGrid = [
        {
            id: 'music',
            title: 'Music',
            image: 'https://via.placeholder.com/100',
            backgroundColor: '#d53ddd',
        },
        {
            id: 'podcasts',
            title: 'Podcasts',
            image: 'https://via.placeholder.com/100',
            backgroundColor: '#6bb430',
        },
        {
            id: 'live',
            title: 'Live Concerts',
            image: 'https://via.placeholder.com/100',
            backgroundColor: '#8c52ff',
        },
        { id: 'forYou', title: 'For You', image: 'https://via.placeholder.com/100', backgroundColor: '#1e3264' },
    ];

    return (
        <Body sectionTitle="Search" userImage="https://via.placeholder.com/36">
            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <MaterialIcons name="search" size={24} color="#888" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="What do you want to listen?"
                        placeholderTextColor="#888"
                        returnKeyType="search"
                        autoCapitalize="none"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={onSubmit}
                    />
                </View>

                {/* If search in progress, show spinner */}
                {loadingSearch && (
                    <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 32 }} />
                )}

                {/* If results exist, render SectionList */}
                {!loadingSearch && results && (
                    <SectionList<SectionItem>
                        sections={sectionsData}
                        keyExtractor={(item) => {
                            // each item type has its own id field
                            if ((item as any).id !== undefined) return (item as any).id.toString();
                            if ((item as any).album_id !== undefined) return (item as any).album_id.toString();
                            return Math.random().toString();
                        }}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
                        )}
                        renderItem={({ item, section }) => {
                            if (section.title === 'Tracks') return renderTrack({ item: item as TrackMeta });
                            if (section.title === 'Artists')
                                return renderArtist({ item: item as unknown as Artist });
                            if (section.title === 'Albums')
                                return renderAlbum({ item: item as unknown as Album });
                            return renderPlaylist({ item: item as unknown as PlaylistResponse });
                        }}
                        contentContainerStyle={styles.resultsContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* If no search results and not loading, show Discover/Tags/Sections */}
                {!loadingSearch && !results && (
                    <ScrollView>
                        {/* Discover / Recommendations */}
                        <Text style={styles.sectionHeader}>Discover something new for you</Text>
                        {loadingRecs ? (
                            <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 12 }} />
                        ) : recommendations.length > 0 ? (
                            <FlatList
                                data={recommendations}
                                horizontal
                                keyExtractor={(t) => t.id.toString()}
                                renderItem={renderRecommendationCard}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 16 }}
                            />
                        ) : (
                            <Text style={styles.emptyText}>No recommendations yet</Text>
                        )}

                        {/* Tags (user’s top genres) */}
                        <Text style={styles.sectionHeader}>Suggestions based on your taste</Text>
                        <View style={styles.tagsRow}>
                            {tags.map((tag) => (
                                <TouchableOpacity key={tag.id} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Browse All Sections Grid */}
                        <Text style={styles.sectionHeader}>Browse all sections</Text>
                        <View style={styles.sectionGrid}>
                            {sectionsGrid.map((sec) => (
                                <TouchableOpacity
                                    key={sec.id}
                                    style={[styles.sectionCard, { backgroundColor: sec.backgroundColor }]}
                                    onPress={() => {
                                        /* optionally navigate to a “section” screen */
                                    }}
                                >
                                    <Text style={styles.sectionCardTitle}>{sec.title}</Text>
                                    <Image source={{ uri: sec.image }} style={styles.sectionCardImage} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>
        </Body>
    );
}

const CARD_SIZE = 100;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: '#fff',
        height: 36,
    },

    sectionHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
    },
    resultsContainer: {
        paddingBottom: 80, // leave room for player bar
    },

    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    resultImage: {
        width: 50,
        height: 50,
        backgroundColor: '#333',
        marginRight: 12,
    },
    resultText: {
        flex: 1,
    },
    resultTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    resultSubtitle: {
        color: '#aaa',
        fontSize: 12,
    },

    suggestionCard: {
        marginRight: 16,
        width: 120,
    },
    suggestionImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    suggestionTitle: {
        color: '#fff',
        marginTop: 8,
        fontSize: 14,
    },

    emptyText: {
        marginLeft: 16,
        color: '#888',
        fontSize: 14,
    },

    tagsRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
    },
    tag: {
        backgroundColor: '#333',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginRight: 8,
    },
    tagText: {
        color: '#fff',
        fontSize: 14,
    },

    sectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    sectionCard: {
        width: '48%',
        height: CARD_SIZE,
        marginBottom: 16,
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    sectionCardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionCardImage: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: CARD_SIZE * 0.6,
        height: CARD_SIZE * 0.6,
        borderRadius: 4,
    },
});
