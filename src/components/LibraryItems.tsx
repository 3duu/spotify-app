import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView
} from 'react-native';
import { getLibraryData, LibraryData } from '../services/api';

export default function LibraryItems() {
    const [library, setLibrary] = useState<LibraryData | null>(null);

    useEffect(() => {
        getLibraryData()
            .then(setLibrary)
            .catch(err => console.error('Failed to load library:', err));
    }, []);

    if (!library) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your library…</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Playlists Section */}
            <Text style={styles.sectionHeader}>Playlists</Text>
            <FlatList
                data={library.playlists}
                horizontal
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <Image source={{ uri: item.icon }} style={styles.cardImage} />
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* Albums Section */}
            <Text style={styles.sectionHeader}>Albums</Text>
            <FlatList
                data={library.albums}
                horizontal
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <Image source={{ uri: item.cover }} style={styles.cardImage} />
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.title} – {item.artist}
                        </Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* Podcasts Section */}
            <Text style={styles.sectionHeader}>Podcasts</Text>
            <FlatList
                data={library.podcasts}
                horizontal
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <Image source={{ uri: item.art }} style={styles.cardImage} />
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
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#aaa',
        fontSize: 16,
    },
    sectionHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16,
    },
    card: {
        width: CARD_SIZE,
        marginRight: 12,
    },
    cardImage: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        marginTop: 6,
    },
});
