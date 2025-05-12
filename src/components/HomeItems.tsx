import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image
} from 'react-native';
import { getUserPlaylists } from '../services/api';

type Playlist = {
    id: string;
    name: string;
    // if your playlist object has a cover image URL, use it here:
    image?: string;
};

export default function HomeItems() {
    const [activeTab, setActiveTab] = useState('All');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    // load the user's playlists once on mount
    useEffect(() => {
        getUserPlaylists().then((data) => {
            setPlaylists(data);
        });
    }, []);

    const categoryTabs = ['All', 'Songs', 'Podcasts'];
    const featured = {
        title: 'Mano a Mano de volta!',
        image: 'https://via.placeholder.com/300x150'
    };
    const sextouData = [
        { id: '1', image: 'https://via.placeholder.com/120' },
        { id: '2', image: 'https://via.placeholder.com/120' },
        { id: '3', image: 'https://via.placeholder.com/120' }
    ];

    return (
        <ScrollView style={styles.container}>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {categoryTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}>
                        <Text
                            style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Grid of Playlists */}
            <Text style={styles.sectionHeader}>Your Playlists</Text>
            <View style={styles.gridContainer}>
                {playlists.map((item) => (
                    <View key={item.id} style={styles.card}>
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.cardImage} />
                        ) : (
                            <View style={styles.placeholder} />
                        )}
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Featured Section */}
            <Text style={styles.sectionHeader}>Chosen for you</Text>
            <View style={styles.featuredContainer}>
                <Image source={{ uri: featured.image }} style={styles.featuredImage} />
                <Text style={styles.featuredTitle}>{featured.title}</Text>
            </View>

            {/* Sextou! Section */}
            <Text style={styles.sectionHeader}>TGIF!</Text>
            <FlatList
                data={sextouData}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.sextouCard}>
                        <Image source={{ uri: item.image }} style={styles.sextouImage} />
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#333',
        borderRadius: 16,
        marginHorizontal: 8
    },
    activeTab: { backgroundColor: '#1DB954' },
    tabText: { color: '#fff', fontSize: 14 },
    activeTabText: { color: '#000', fontWeight: 'bold' },

    sectionHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 16
    },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    card: { width: '48%', marginBottom: 16 },
    cardImage: { width: '100%', aspectRatio: 1, borderRadius: 8 },
    placeholder: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: '#333'
    },
    cardTitle: { color: '#fff', marginTop: 8, fontSize: 12 },

    featuredContainer: { marginBottom: 16 },
    featuredImage: { width: '100%', height: 150, borderRadius: 8 },
    featuredTitle: { color: '#fff', fontSize: 16, marginTop: 8 },

    sextouCard: { marginRight: 16 },
    sextouImage: { width: 120, height: 120, borderRadius: 8 }
});
