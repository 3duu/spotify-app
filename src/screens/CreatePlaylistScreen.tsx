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
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import api from '../services/api';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../App";
import Toast from "react-native-toast-message";

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
            return Toast.show({type: 'error', text1: 'Oops!', text2: 'Please enter a name'});
        }

        try {
            const resp = await api.post('/playlists', { title: title.trim() });
            const newPlaylist = resp.data as { id: number; title: string; cover: string };

            if (trackId) {
                await api.post(`/playlists/${newPlaylist.id}/tracks`, { track_id: +trackId });
            }

            navigation.replace('Playlist', { id: newPlaylist.id});
        } catch (err) {
            console.error(err);
            Toast.show({type: 'error',
                text1: 'Oops!',
                text2: 'Could not create playlist. Please try again.'});
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
