import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet
} from 'react-native';
import api, { getLibraryData, LibraryData } from '../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {RootStackParamList} from "../../App";
import {useNavigation} from "@react-navigation/native";

export default function LibraryItems() {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [library, setLibrary] = useState<LibraryData | null>(null);

    useEffect(() => {
        getLibraryData()
            .then(data => setLibrary(data))
            .catch(err => {
                console.error('Failed to load library:', err);
            });
    }, []);

    if (!library) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your library…</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Playlists Section */}
            <Text style={styles.sectionHeader}>Playlists</Text>
            <FlatList
                data={library.playlists}
                horizontal
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                     <TouchableOpacity
                       key={item.id}
                       style={styles.card}
                       onPress={() => {
                           navigation.navigate('TrackList', {
                               id: item.id,
                               title: item.title,
                               mode: 'playlist'
                           });
                       }}
                     >
                        <Image source={{ uri: api.getUri() + item.cover }} style={styles.cardImage} />
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.subtitle && (
                            <Text style={styles.cardSubtitle} numberOfLines={1}>
                                {item.subtitle}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* Albums Section */}
            <Text style={styles.sectionHeader}>Albums</Text>
            <FlatList
                data={library.albums}
                horizontal
                keyExtractor={item => item.album_id.toString()}
                renderItem={({ item }) => {
                    const key = item.album_id.toString();
                    return (
                        <TouchableOpacity key={key} style={styles.card}
                          onPress={() => {
                              navigation.navigate('TrackList', {
                                id: item.album_id,
                                title: item.title,
                                mode: 'album'
                            });
                        }}
                        >
                            <Image source={{ uri: api.getUri() + item.cover }} style={styles.cardImage} />
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {item.title} – {item.artist?.name}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                showsHorizontalScrollIndicator={false}
            />

            {/* Podcasts Section */}
            <Text style={styles.sectionHeader}>Podcasts</Text>
            <FlatList
                data={library.podcasts}
                horizontal
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity key={item.id} style={styles.card}
                                      onPress={() => {
                                          navigation.navigate('TrackList', {
                                              id: item.id,
                                              title: item.title,
                                              mode: 'podcast'
                                          });
                                      }}>
                        <Image source={{ uri: api.getUri() + item.cover }} style={styles.cardImage} />
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />
        </ScrollView>
    );
}

const CARD_SIZE = 120;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        color: '#aaa',
        fontSize: 16
    },
    sectionHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 8
    },
    card: {
        width: CARD_SIZE,
        marginRight: 12
    },
    cardImage: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        //borderRadius: 8,
        backgroundColor: '#333'
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        marginTop: 6
    },
    cardSubtitle: {
        color: '#aaa',
        fontSize: 12
    }
});
