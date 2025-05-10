import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

// Fetch a list of recent tracks (demo: tracks 1–10)
export async function getRecentTracks() {
    const requests = Array.from({ length: 10 }, (_, i) =>
        api.get(`/tracks/${i + 1}`).then(res => ({
            id: res.data.id,
            name: res.data.title,
            image: '',
            duration: res.data.duration,
            artist: undefined
        }))
    );
    return Promise.all(requests);
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