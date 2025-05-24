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
    id:        number;
    title:     string;
    artist:    string;
    artist_id: number;
    album_id: number;
    audio_url: string;
    album_art?:string;
    duration:     number;
    color:     string;
}

export function getTrack(id: number): Promise<TrackMeta> {
    return api.get<TrackMeta>(`/tracks/${id}`).then(res => res.data);
}

export interface LibraryData {
    playlists: {
        id: number;
        title: string;
        subtitle: string;
        cover: string;
        last_updated: string;
    }[];
    albums: {
        album_id: string;
        title: string;
        artist: {
            name: string;
        };
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
    const response = api.get<LibraryData>('/library').then(res => res.data);
    console.log(response);
    return response;
}

export interface Artist {
    artist_id: number;
    name: string;
    image: string;
}

export interface Album {
    album_id: number;
    title:    string;
    artist:   string;
    cover:    string;
}

export interface SearchResults {
    tracks:    TrackMeta[];
    artists:   Artist[];
    albums:    Album[];
    playlists: PlaylistResponse[];
}

/** Call GET /search?q=... and return all four result lists */
export function search(query: string): Promise<SearchResults> {
    return api
        .get<SearchResults>('/search', { params: { q: query } })
        .then(res => res.data);
}

export interface TrackItem {
    id:         number;
    title:      string;
    artist:     string;
    album_art:   string;
    video:      boolean;
    downloaded: boolean;
}

export interface PlaylistDetail {
    id:          number;
    title:       string;
    cover:       string;
    ownerName:   string;
    ownerImage:  string;
    duration:    string;
    tracks:      TrackItem[];
}

export function getPlaylist(id: number) {
    return api.get<PlaylistDetail>(`/playlists/${id}`).then(r => r.data);
}

// at top with your existing imports
export function addTrackToPlaylist(plId: number, trackId: number) {
    return api.post(`/playlists/${plId}/tracks`, { track_id: +trackId });
}

export function removeTrackFromPlaylist(plId: number, trackId: number) : Promise<any> {
    return api.delete(`/playlists/${plId}/tracks/${trackId}`);
}

export function updatePlaylistMeta(
    plId: number,
    meta: { title: string; cover?: string }
) {
    return api.put(`/playlists/${plId}`, meta);
}

export function reorderPlaylist(plId: number, trackIds: number[]) {
    return api.put(`/playlists/${plId}/reorder`, { track_ids: trackIds.map(id => +id) });
}

export default api;
