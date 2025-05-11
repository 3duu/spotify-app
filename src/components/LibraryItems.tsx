import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import {getRecentPlaylists} from '../services/api';

type Playlist = {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
};

export default function LibraryItems() {
    const [recents, setRecents] = useState<Playlist[]>([]);

    useEffect(() => {
        getRecentPlaylists().then(response => {
            setRecents(response);
        });

    }, []);

    return (
        <FlatList
            data={recents}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.headerText}>Recents</Text>
                    {/* grid icon would go here */}
                </View>
            }
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.item}>
                    <Image source={{ uri: item.icon }} style={styles.icon} />
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.subtitle}>{item.subtitle}</Text>
                    </View>
                </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80, // leave space for player bar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    headerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: '#333',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
    },
    subtitle: {
        color: '#aaa',
        fontSize: 12,
    },
});
