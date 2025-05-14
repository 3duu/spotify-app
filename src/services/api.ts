import axios from 'axios';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.68.107:8080', // update for your backend URL
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

// fetch up to 10 of the user's most recently updated playlists
export function getRecentPlaylists(userId: number) : Promise<PlaylistResponse[]> {
    return api
        .get<PlaylistResponse[]>(`/users/${userId}/recent-playlists`)
        .then((res) => res.data);
}

// Mock top artists based on recent tracks
export async function getTopArtists() {
    const tracks = await getRecentTracks();
    const unique = Array.from(new Set(tracks.map(t => t.artist))).slice(0, 5);
    return unique.map((name, idx) => ({ id: `artist-${idx + 1}`, name, image: '' }));
}

export interface PlaylistResponse {
    id: number;
    title: string;
    subtitle: string;
    cover: string;
    last_updated: string;
}

// fetch *all* playlists for the current user
export function getUserPlaylists() {
    return api
        .get<PlaylistResponse[]>('/me/playlists') // adjust path if needed
        .then((res) => res.data);
}

export interface UserProfile {
    id: string;
    name: string;
    image: string;
}

export function getCurrentUser() {
    return api.get<UserProfile>("/me").then(res => res.data);
}

export interface TrackMeta {
    id:        string;
    title:     string;
    artist:    string;
    audio_url: string;
    album_art?:string;
}

export function getTrack(id: string): Promise<TrackMeta> {
    return api.get<TrackMeta>(`/tracks/${id}`).then(res => res.data);
}

export interface LibraryData {
    playlists: {
        id: string;
        title: string;
        subtitle: string;
        cover: string;
        last_updated: string;
    }[];
    albums: {
        id: string;
        title: string;
        artist: string;
        cover: string;
    }[];
    podcasts: {
        id: string;
        title: string;
        hosts: string[];
        cover: string;
    }[];
}

export function getLibraryData(): Promise<LibraryData> {
    return api.get<LibraryData>('/library').then(res => res.data);
}

export default api;