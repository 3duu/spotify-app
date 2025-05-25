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
import api, {
    getRecentPlaylists, PlaylistResponse,
} from '../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../../App";

export default function HomeItems() {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState('All');
    const [playlists, setPlaylists] = useState<PlaylistResponse[]>([]);

    useEffect(() => {
        // 1) Try fetching recent playlists first
        getRecentPlaylists(1)
            .then((recent) => {
                if (recent.length > 0) {
                    setPlaylists(recent);
                } else {
                    // 2) If no recents, load all playlists
                    return getRecentPlaylists(1).then(all => setPlaylists(all));
                }
            })
            .catch((err) => {
                console.error('Failed to load recent playlists, falling back to all:', err);
                // On error, also fall back
                getRecentPlaylists(1).then(all => setPlaylists(all));
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

            {/* Grid of Playlists */}
            <Text style={styles.sectionHeader}>Your Playlists</Text>
            <View style={styles.gridContainer}>
                {/*{playlists.map(item => (
                    <View key={item.id} style={styles.card}>*/}
                       {playlists.map(item => (
                             <TouchableOpacity
                               key={item.id}
                               style={styles.card}
                               onPress={() => navigation.navigate('Playlist', { playlistId: item.id, title: item.title })}
                             >
                                {item.cover ? (
                                    <Image source={{ uri: api.getUri() + item.cover }} style={styles.cardImage} />
                                ) : (
                                    <View style={styles.placeholder} />
                                )}
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {item.subtitle}
                                </Text>
                             </TouchableOpacity>
                    /*</View>*/

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
                keyExtractor={item => item.id}
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
    cardImage: { width: '100%', aspectRatio: 1 },
    placeholder: {
        width: '100%',
        aspectRatio: 1,
        //borderRadius: 8,
        backgroundColor: '#333'
    },
    cardTitle: { color: '#fff', marginTop: 8, fontSize: 12 },

    featuredContainer: { marginBottom: 16 },
    featuredImage: { width: '100%', height: 150, borderRadius: 8 },
    featuredTitle: { color: '#fff', fontSize: 16, marginTop: 8 },

    sextouCard: { marginRight: 16 },
    sextouImage: { width: 120, height: 120, borderRadius: 8 }
});
