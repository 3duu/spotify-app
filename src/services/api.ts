import axios from 'axios';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.68.105:8080', // update for your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Fetch a list of recent tracks (demo: tracks 1–10)
export async function getRecentTracks() {
    const requests = Array.from({ length: 10 }, (_, i) =>
        api.get(`/tracks/${i + 1}`).then(res => ({
            id: res.data.id,
            name: res.data.title,
            artist: res.data.artist,
            image: '',
            duration: res.data.duration,
            audio_url: res.data.audio_url,
        }))
    );
    return Promise.all(requests);
}

// Get recent playlists for Library screen
export async function getRecentPlaylists() {
    const res = await api.get<{
        id: string;
        title: string;
        subtitle: string;
        icon: string;
    }[]>('/library/recent-playlists');
    return res.data;
}

// Mock top artists based on recent tracks
export async function getTopArtists() {
    const tracks = await getRecentTracks();
    const unique = Array.from(new Set(tracks.map(t => t.artist))).slice(0, 5);
    return unique.map((name, idx) => ({ id: `artist-${idx + 1}`, name, image: '' }));
}

// Mock user playlists
export async function getUserPlaylists() {
    return [
        { id: 'playlist-1', name: 'My Favorites' },
        { id: 'playlist-2', name: 'Chill Vibes' },
        { id: 'playlist-3', name: 'Workout' },
    ];
}

export interface UserProfile {
    id: string;
    name: string;
    image: string;
}

export function getCurrentUser() {
    return api.get<UserProfile>("/me").then(res => res.data);
}

export default api;