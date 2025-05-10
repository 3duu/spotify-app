import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Sidebar from '../components/Sidebar';
import UserRecentlyPlayed from '../components/UserRecentlyPlayed';
import UserTopArtists from '../components/UserTopArtists';
import UserPlaylists from '../components/UserPlaylists';
import Player from '../components/Player';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.sidebar}> <Sidebar /> </View>
            <View style={styles.content}>
                <ScrollView>
                    <UserRecentlyPlayed navigation={navigation} />
                    <UserTopArtists />
                    <UserPlaylists />
                </ScrollView>
            </View>
            <View style={styles.player}> <Player /> </View>
        </View>
    );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#121212', flexDirection: 'row' }, sidebar: { width: 80, backgroundColor: '#000' }, content: { flex: 1, padding: 16 }, player: { position: 'absolute', bottom: 0, left: 80, right: 0, backgroundColor: '#181818' } });
