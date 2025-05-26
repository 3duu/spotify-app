import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SectionList,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api, { search, SearchResults, TrackMeta, Artist, Album, PlaylistResponse } from '../services/api';
import { useAppDispatch } from '../store';
import {setPlaying, setQueue} from '../store/slices/playerSlice';
import Body from '../components/Body';
import {TrackListMode} from "./TrackListScreen";
import {useNavigation} from "@react-navigation/native";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../App";

const suggestions = [
    { id: '1', title: 'Music for you', image: 'https://via.placeholder.com/120x160' },
    { id: '2', title: '#metal',       image: 'https://via.placeholder.com/120x160' },
    { id: '3', title: '#trancecore',  image: 'https://via.placeholder.com/120x160' },
];

const sectionsGrid = [
    { id: 'music',   title: 'Music',           image: 'https://via.placeholder.com/100', backgroundColor:'#d53ddd' },
    { id: 'podcasts',title: 'Podcasts',        image: 'https://via.placeholder.com/100', backgroundColor:'#6bb430' },
    { id: 'live',    title: 'Live Concerts',   image: 'https://via.placeholder.com/100', backgroundColor:'#8c52ff' },
    { id: 'forYou',  title: 'For You',         image: 'https://via.placeholder.com/100', backgroundColor:'#1e3264' },
];

type SectionItem = TrackMeta | Artist | Album | PlaylistResponse;

export default function SearchScreen() {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    // we keep a ref to the timer so we can clear it
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // 1) Run the search 500ms after the user stops typing:
    useEffect(() => {
        // clear any pending timer
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // if query is empty, clear results
        if (!query.trim()) {
            setResults(null);
            return;
        }

        // set a new timer
        debounceRef.current = setTimeout(() => {
            setLoading(true);
            search(query.trim())
                .then(res => setResults(res))
                .catch(console.error)
                .finally(() => setLoading(false));
        }, 500); // 0.5s debounce

        // cleanup on unmount or before next effect run
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    const onSubmit = () => {
        if (!query.trim()) return;
        // we can just call the same code immediately:
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setLoading(true);
        search(query.trim())
            .then(res => setResults(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    function renderTrack({ item }: { item: TrackMeta }) {
        return (
            <TouchableOpacity
                style={styles.resultItem}
                        onPress={() => {
                            // queue up just this one track and play it
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
                        title: item.name,
                        mode: 'artist'
                    });
                }}
            >
                <Image source={{ uri: api.getUri() + item.image }} style={styles.resultImage} />
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
                        title: item.title,
                        mode: 'album'
                    });
                }}
            >
                <Image source={{ uri: api.getUri() + item.cover }} style={styles.resultImage} />
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultSubtitle}>{item.artist}</Text>
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
                        title: item.title,
                        mode: 'playlist'
                    });
                }}
            >
                <Image source={{ uri: api.getUri() + item.cover }} style={styles.resultImage} />
                <Text style={styles.resultTitle}>{item.title}</Text>
            </TouchableOpacity>
        );
    }

      // explicitly type your sections array as SectionListData<SectionItem, string>[]
      const sectionsData = results
        ? [
                    { title: 'Tracks',    data: results.tracks    },
                    { title: 'Artists',   data: results.artists   },
                    { title: 'Albums',    data: results.albums    },
                    { title: 'Playlists', data: results.playlists },
                  ]
            : [];


    const userImage = 'https://via.placeholder.com/36';

    return (
        <Body sectionTitle="Search" userImage={userImage}>
            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    {/*<TouchableOpacity onPress={onSubmit} style={styles.searchIconButton}>*/}
                        <MaterialIcons name="search" size={24} color="#888"/>
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
                    {/*</TouchableOpacity>*/}
                </View>

                {loading && (
                    <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 32 }} />
                )}

                {!loading && results && (
                    <SectionList<SectionItem>
                        sections={sectionsData}
                        keyExtractor={item => {
                            // each item type has its own id field
                            return (
                                (item as any).id ||
                                (item as any).album_id?.toString() ||
                                Math.random().toString()
                            );
                        }}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
                        )}
                        renderItem={({ item, section }) => {
                            if (section.title === 'Tracks') return renderTrack({ item: item as TrackMeta });
                            if (section.title === 'Artists') return renderArtist({ item: item as unknown as Artist });
                            if (section.title === 'Albums') return renderAlbum({ item: item as unknown as Album });
                            return renderPlaylist({ item: item as unknown as PlaylistResponse });
                        }}
                        contentContainerStyle={styles.resultsContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {!loading && !results && (
                    <>
                        <Text style={styles.sectionHeader}>Discover something new for you</Text>
                        <FlatList
                            data={suggestions}
                            horizontal
                            keyExtractor={item => item.id}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View style={styles.suggestionCard}>
                                    <Image source={{ uri: item.image }} style={styles.suggestionImage} />
                                    <Text style={styles.suggestionTitle}>{item.title}</Text>
                                </View>
                            )}
                        />

                        <Text style={styles.sectionHeader}>Browse all sections</Text>
                        <View style={styles.sectionGrid}>
                            {sectionsGrid.map(sec => (
                                <TouchableOpacity
                                    key={sec.id}
                                    style={[styles.sectionCard, { backgroundColor: sec.backgroundColor }]}
                                    onPress={() => {/* optionally navigate */}}
                                >
                                    <Text style={styles.sectionCardTitle}>{sec.title}</Text>
                                    <Image source={{ uri: sec.image }} style={styles.sectionCardImage} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
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
        paddingBottom: 80, // leave room for player
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    resultImage: {
        width: 50,
        height: 50,
        //borderRadius: 4,
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
        height: 160,
        //borderRadius: 8,
    },
    suggestionTitle: {
        color: '#fff',
        marginTop: 8,
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
        //borderRadius: 8,
        marginBottom: 16,
        justifyContent: 'center',
        padding: 12,
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
        //borderRadius: 4,
    },
    searchIconButton: {
        marginLeft: 8,              // space between input and icon
        padding: 4,                 // larger hit area
    },
});
