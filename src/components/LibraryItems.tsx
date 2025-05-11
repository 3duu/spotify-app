import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';

const libraryTabs = ['Playlists', 'Podcasts', 'Albums', 'Artists', 'Stations'];
const recents = [
    { id: '1', title: 'Músicas Curtidas', subtitle: 'Playlist • 27 músicas', icon: 'https://via.placeholder.com/50' },
    { id: '2', title: 'Novos episódios', subtitle: 'Atualizado em 23 de abr. de 2025', icon: 'https://via.placeholder.com/50' },
    { id: '3', title: 'Seus episódios', subtitle: 'Episódios salvos e baixados', icon: 'https://via.placeholder.com/50' },
    { id: '4', title: 'Kr4wl1n6 xx24', subtitle: 'Playlist • Eduardo Porto de Araujo', icon: 'https://via.placeholder.com/50' },
    { id: '5', title: 'Viagem Rio', subtitle: 'Playlist • Vinicius M Santos', icon: 'https://via.placeholder.com/50' },
    { id: '6', title: 'One More Time', subtitle: 'Playlist • Eduardo Porto de Araujo', icon: 'https://via.placeholder.com/50' },
];

export default function LibraryItems() {
    const [activeTab, setActiveTab] = React.useState(libraryTabs[0]);

    return (
        <ScrollView style={libraryStyles.container}>
            {/* Tabs */}
            <View style={libraryStyles.tabsContainer}>
                {libraryTabs.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[libraryStyles.tab, activeTab === tab && libraryStyles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[libraryStyles.tabText, activeTab === tab && libraryStyles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Recents Section */}
            <View style={libraryStyles.recentsHeader}>
                <Text style={libraryStyles.recentsText}>Recents</Text>
                <TouchableOpacity>
                    <Text style={libraryStyles.gridIcon}>☷</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={recents}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={libraryStyles.itemRow}>
                        <Image source={{ uri: item.icon }} style={libraryStyles.itemIcon} />
                        <View style={libraryStyles.itemTextContainer}>
                            <Text style={libraryStyles.itemTitle}>{item.title}</Text>
                            <Text style={libraryStyles.itemSubtitle}>{item.subtitle}</Text>
                        </View>
                    </View>
                )}
            />
        </ScrollView>
    );
}

const libraryStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    tabsContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8 },
    tab: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#333', borderRadius: 16, marginRight: 8 },
    activeTab: { backgroundColor: '#1DB954' },
    tabText: { color: '#fff', fontSize: 14 },
    activeTabText: { color: '#000', fontWeight: 'bold' },
    recentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 },
    recentsText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    gridIcon: { color: '#fff', fontSize: 20 },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
    itemIcon: { width: 50, height: 50, borderRadius: 4, marginRight: 12 },
    itemTextContainer: { flex: 1 },
    itemTitle: { color: '#fff', fontSize: 16 },
    itemSubtitle: { color: '#888', fontSize: 12, marginTop: 4 },
});