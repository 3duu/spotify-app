import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import {getUserPlaylists, PlaylistResponse} from '../services/api';
import type { RootStackParamList } from '../../App';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// Navigation prop for potential PlaylistDetails screen (optional)
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TrackDetails'>;

export default function UserPlaylists() {
    const [playlists, setPlaylists] = React.useState<PlaylistResponse[]>([]);
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        getUserPlaylists().then(setPlaylists);
    }, []);

    const renderItem = ({ item }: { item: PlaylistResponse }) => (
        <TouchableOpacity
            style={styles.item}
            // If you implement a PlaylistDetails screen, you can navigate like this:
            // onPress={() => navigation.navigate('PlaylistDetails', { id: item.id })}
        >
            <Text style={styles.name}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Playlists</Text>
            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    header: { color: '#fff', fontSize: 20, marginBottom: 8 },
    list: { paddingBottom: 16 },
    item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
    name: { color: '#fff', fontSize: 16 },
});
