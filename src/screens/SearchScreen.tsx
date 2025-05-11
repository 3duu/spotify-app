import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Body from '../components/Body';

interface Suggestion {
    id: string;
    title: string;
    image: string;
}

interface Section {
    id: string;
    title: string;
    image: string;
    backgroundColor: string;
}

const suggestions: Suggestion[] = [
    {
        id: '1',
        title: 'Música para você',
        image: 'https://via.placeholder.com/120x160'
    },
    { id: '2', title: '#metal', image: 'https://via.placeholder.com/120x160' },
    { id: '3', title: '#trancecore', image: 'https://via.placeholder.com/120x160' }
];

const sections: Section[] = [
    { id: 'music', title: 'Música', image: 'https://via.placeholder.com/100', backgroundColor: '#d53ddd' },
    { id: 'podcasts', title: 'Podcasts', image: 'https://via.placeholder.com/100', backgroundColor: '#6bb430' },
    { id: 'live', title: 'Eventos ao vivo', image: 'https://via.placeholder.com/100', backgroundColor: '#8c52ff' },
    { id: 'forYou', title: 'Feito para você', image: 'https://via.placeholder.com/100', backgroundColor: '#1e3264' }
];

export default function SearchScreen() {
    const userImage = 'https://via.placeholder.com/36';

    return (
        <Body sectionTitle="Buscar" userImage={userImage}>
            <ScrollView style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <MaterialIcons name="search" size={24} color="#888" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="O que você quer ouvir?"
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity>
                        <MaterialIcons name="photo-camera" size={24} color="#888" />
                    </TouchableOpacity>
                </View>

                {/* Discover Suggestions */}
                <Text style={styles.sectionHeader}>Descubra algo novo pra você</Text>
                <FlatList
                    data={suggestions}
                    horizontal
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.suggestionCard}>
                            <Image source={{ uri: item.image }} style={styles.suggestionImage} />
                            <Text style={styles.suggestionTitle}>{item.title}</Text>
                        </View>
                    )}
                />

                {/* Browse Sections Grid */}
                <Text style={styles.sectionHeader}>Navegar por todas as seções</Text>
                <View style={styles.sectionGrid}>
                    {sections.map((sec) => (
                        <TouchableOpacity
                            key={sec.id}
                            style={[styles.sectionCard, { backgroundColor: sec.backgroundColor }]}
                        >
                            <Text style={styles.sectionCardTitle}>{sec.title}</Text>
                            <Image source={{ uri: sec.image }} style={styles.sectionCardImage} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </Body>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 16 },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16
    },
    searchInput: { flex: 1, marginLeft: 8, color: '#fff' },
    sectionHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginVertical: 16 },
    suggestionCard: { marginRight: 16, width: 120 },
    suggestionImage: { width: 120, height: 160, borderRadius: 8 },
    suggestionTitle: { color: '#fff', marginTop: 8, fontSize: 14 },
    sectionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    sectionCard: {
        width: '48%',
        height: 100,
        borderRadius: 8,
        marginBottom: 16,
        justifyContent: 'center',
        padding: 12
    },
    sectionCardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    sectionCardImage: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 60,
        height: 60,
        borderRadius: 4
    }
});