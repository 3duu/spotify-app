import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Share } from 'react-native';
import RNModal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store';
import {
    setQueue,
    setPlaying
} from '../store/slices/playerSlice';
import api, {
    removeTrackFromPlaylist
} from '../services/api';
import type { RootStackParamList } from '../../App';

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

export interface TrackMenuProps {
    isVisible: boolean;
    onClose: () => void;
    track: {
        id: number;
        title: string;
        artist: string;
        album_id?: number;
        artist_id?: number;
        originId?: number;
        album_art?: string;
    };
    /// If you opened the menu from inside a playlist:
    playlistId?: number;
}

export default function TrackMenu({
                                      isVisible,
                                      onClose,
                                      track,
                                      playlistId
                                  }: TrackMenuProps) {
    const nav = useNavigation<RootNavProp>();
    const dispatch = useAppDispatch();
    const queue = useAppSelector(s => s.player.queue);

    const { id, title, artist } = track;

    const doAddToPlaylist = () => {
        onClose();
        nav.navigate('AddToPlaylist', { trackId: id });
    };

    const doRemoveFromPlaylist = async () => {
        if (playlistId) {
            await removeTrackFromPlaylist(playlistId, id);
            // you might want to re-fetch the playlist in parent screen…
        }
        onClose();
    };

    const doAddToQueue = () => {
        dispatch(setQueue([...queue, id]));
        dispatch(setPlaying());
        onClose();
    };

    const doPlayNext = () => {
        dispatch(setQueue([id, ...queue]));
        dispatch(setPlaying());
        onClose();
    };

    const doShare = async () => {
        await Share.share({
            message: `${title} – http://your-backend/tracks/${id}`
        });
        onClose();
    };

    const doGoToAlbum = () => {
        onClose();
        nav.navigate('TrackDetails', { id, origin: 'playlist', originId: playlistId });
    };

    const doGoToArtist = () => {
        onClose();
        nav.navigate('TrackDetails', { id, origin: 'playlist', originId: playlistId });
    };

    return (
        <RNModal
            isVisible={isVisible}
            onBackdropPress={onClose}
            swipeDirection="down"
            onSwipeComplete={onClose}
            style={styles.modal}
        >
            <View style={styles.container}>
                <View style={styles.handle} />
                <View style={styles.header}>
                    <Image
                        source={{ uri: api.getUri() + track.album_art }}
                        style={styles.art}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        <Text style={styles.subtitle}>{artist}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.row} onPress={doAddToPlaylist}>
                    <MaterialIcons name="playlist-add" size={20} color="#fff" />
                    <Text style={styles.label}>Add to Playlist</Text>
                </TouchableOpacity>
                {playlistId != null && (
                    <TouchableOpacity style={styles.row} onPress={doRemoveFromPlaylist}>
                        <MaterialIcons name="remove-circle-outline" size={20} color="#fff" />
                        <Text style={styles.label}>Remove from Playlist</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.row} onPress={doAddToQueue}>
                    <MaterialIcons name="playlist-play" size={20} color="#fff" />
                    <Text style={styles.label}>Add to Queue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={doPlayNext}>
                    <MaterialIcons name="queue-music" size={20} color="#fff" />
                    <Text style={styles.label}>Play Next</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={doShare}>
                    <MaterialIcons name="share" size={20} color="#fff" />
                    <Text style={styles.label}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={doGoToAlbum}>
                    <MaterialIcons name="album" size={20} color="#fff" />
                    <Text style={styles.label}>Go to Album</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={doGoToArtist}>
                    <MaterialIcons name="person" size={20} color="#fff" />
                    <Text style={styles.label}>Go to Artist</Text>
                </TouchableOpacity>
            </View>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    modal:      { justifyContent: 'flex-end', margin: 0 },
    container: {
        backgroundColor: '#121212',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    handle:   { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
    header:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    art:      { width: 48, height: 48, borderRadius: 4, backgroundColor: '#333' },
    title:    { color: '#fff', fontSize: 16, fontWeight: '600' },
    subtitle: { color: '#aaa', fontSize: 12, marginTop: 4 },
    row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    label:    { color: '#fff', fontSize: 14, marginLeft: 16 },
});
