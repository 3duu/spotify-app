import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getTopArtists } from '../services/api';

type Artist = {
    id: string;
    name: string;
    image: string;
};

export default function UserTopArtists() {
    const [artists, setArtists] = React.useState<Artist[]>([]);

    useEffect(() => {
        getTopArtists().then(setArtists);
    }, []);

    const renderItem = ({ item }: { item: Artist }) => (
        <TouchableOpacity style={styles.card}>
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
                <View style={styles.placeholder} />
            )}
            <Text style={styles.name} numberOfLines={1}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Top Artists</Text>
            <FlatList
                data={artists}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
}

const CARD_SIZE = 100;

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    header: { color: '#fff', fontSize: 20, marginBottom: 8 },
    card: { width: CARD_SIZE, alignItems: 'center', marginRight: 16 },
    image: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: CARD_SIZE / 2, marginBottom: 4 },
    placeholder: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: CARD_SIZE / 2, backgroundColor: '#333', marginBottom: 4 },
    name: { color: '#fff', fontSize: 14, textAlign: 'center' },
});