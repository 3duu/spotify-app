import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import api from '../services/api';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../App";

type ParamList = {
    CreatePlaylist: { trackId?: string };
};

type CreateNavProp = NativeStackNavigationProp<RootStackParamList, 'CreatePlaylist'>;

export default function CreatePlaylistScreen() {
    const navigation = useNavigation<CreateNavProp>();
    const route = useRoute<RouteProp<ParamList, 'CreatePlaylist'>>();
    const trackId = route.params?.trackId;

    const [title, setTitle] = useState('');

    const onClose = () => navigation.goBack();

    const onCreate = async () => {
        if (!title.trim()) {
            return Alert.alert('Please enter a playlist name');
        }

        try {
            // 1) create the playlist
            const resp = await api.post('/playlists', { title: title.trim() });
            const newPlaylist = resp.data as { id: number; title: string; cover: string };

            // 2) if we came here with a trackId, immediately add that track
            if (trackId) {
                await api.post(`/playlists/${newPlaylist.id}/tracks`, { track_id: +trackId });
            }

            // 3) navigate into the newly created playlist screen
            navigation.replace('Playlist', { id: newPlaylist.id.toString() });
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not create playlist. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#121212' }}
            behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
            <SafeAreaView style={styles.safe}>
                {/* header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* prompt */}
                <Text style={styles.prompt}>Give your playlist a name</Text>

                {/* input */}
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="New playlist name"
                    placeholderTextColor="#888"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={onCreate}
                />

                {/* create button */}
                <TouchableOpacity style={styles.createBtn} onPress={onCreate}>
                    <Text style={styles.createText}>Create</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 16,
        right: 16,
    },
    prompt: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 32,
    },
    input: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#444',
        paddingVertical: 8,
        marginBottom: 40,
    },
    createBtn: {
        alignSelf: 'center',
        backgroundColor: '#1DB954',
        borderRadius: 24,
        paddingHorizontal: 40,
        paddingVertical: 12,
    },
    createText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
