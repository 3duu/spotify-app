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
    },
});

export const { playPause, setTrack } = playerSlice.actions;
export default playerSlice.reducer;