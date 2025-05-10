import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getRecentTracks } from '../services/api';
import type { RootStackParamList } from '../../App';

// Define the type for a track item
type Track = {
    id: string;
    name: string;
    image: string;
    duration: number;
    audio_url?: string;
};

// Navigation prop for TrackDetails
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TrackDetails'>;

export default function UserRecentlyPlayed() {
    const navigation = useNavigation<NavigationProp>();
    const [tracks, setTracks] = React.useState<Track[]>([]);

    useEffect(() => {
        getRecentTracks().then(setTracks);
    }, []);

    const renderItem = ({ item }: { item: Track }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TrackDetails', { id: item.id })}
        >
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
                <View style={styles.placeholder} />
            )}
            <Text style={styles.title} numberOfLines={1}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Recently Played</Text>
            <FlatList
                data={tracks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    header: { color: '#fff', fontSize: 20, marginBottom: 8 },
    card: { marginRight: 16, width: 100, alignItems: 'center' },
    image: { width: 100, height: 100, borderRadius: 8, marginBottom: 4 },
    placeholder: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#333', marginBottom: 4 },
    title: { color: '#fff', fontSize: 14, textAlign: 'center' },
});