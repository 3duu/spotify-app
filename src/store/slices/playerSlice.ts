import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
    isPlaying: boolean;
    currentTrackId: string | null;
}

const initialState: PlayerState = { isPlaying: false, currentTrackId: null };

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        playPause(state) {
            state.isPlaying = !state.isPlaying;
        },
        setTrack(state, action: PayloadAction<string>) {
            state.currentTrackId = action.payload;
            state.isPlaying = true;
        },
        setPlaying(state) {
            state.isPlaying = true;
        },
        setPaused(state) {
            state.isPlaying = false;
        },
    },
});

export const { playPause, setTrack, setPlaying, setPaused } = playerSlice.actions;
export default playerSlice.reducer;