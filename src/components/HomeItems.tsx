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
    getRecentPlaylists, PlaylistResponse, Newsletter, getNewsletters
} from '../services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../../App";

export default function HomeItems() {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab]         = useState('All');
    const [newsletters, setNewsletters]     = useState<Newsletter[]>([]);
    const [playlists, setPlaylists] = useState<PlaylistResponse[]>([]);

    useEffect(() => {
              // just load the newsletters once
            getNewsletters()
                .then(data => setNewsletters(data))
                .catch(err => console.error('Failed to load newsletters:', err));
    }, []);

    useEffect(() => {
        // Load playlists when the component mounts
        getRecentPlaylists(1) // replace with actual user ID if needed
            .then(data => setPlaylists(data))
            .catch(err => console.error('Failed to load playlists:', err));
    }, []);

    const categoryTabs = ['All', 'Songs', 'Podcasts'];

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
                   {playlists.map(item => (
                         <TouchableOpacity
                           key={item.id}
                           style={styles.card}
                           onPress={() => navigation.navigate('TrackList', { id: item.id, title: item.title, mode: 'playlist' })}
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
                ))}
            </View>

            {/* Featured (newsletter) Section */}
            <Text style={styles.sectionHeader}>Chosen for you</Text>

            <View style={styles.gridContainer}>
                {newsletters.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.card}
                        onPress={() => {
                            const validModes: Array<'playlist' | 'album' | 'artist' | 'podcast'> = ['playlist', 'album', 'artist', 'podcast'];
                            const mode = validModes.includes(item.type.toLowerCase() as any) ? item.type.toLowerCase() : 'playlist';
                            navigation.navigate('TrackList', { id: item.item_id, title: item.title, mode });
                        }}
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

            
        </ScrollView>
    );
}

const CARD_SIZE = 120;

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
    featuredTitle: { color: '#fff', fontSize: 16, marginTop: 8 },
    featuredSubtitle: { color: '#fff', fontSize: 10, marginTop: 4 },
});
