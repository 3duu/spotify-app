import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
    queue:        number[];   // array of track IDs
    index:        number;     // which track in the queue is current
    isPlaying:    boolean;
    currentTrackId: number | null;
}

const initialState: PlayerState = {
    queue:     [],
    index:     0,
    isPlaying: false,
    currentTrackId: null
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setQueue(state, action: PayloadAction<number[]>) {
            state.queue = action.payload;
            state.index = 0;
        },
        nextTrack(state) {
            if (state.index < state.queue.length - 1) {
                state.index += 1;
            } else {
                state.isPlaying = false; // end of queue
            }
        },
        prevTrack(state) {
            if (state.index > 0) {
                state.index -= 1;
            }
        },
        setPlaying(state) {
            state.isPlaying = true;
        },
        setPaused(state) {
            state.isPlaying = false;
        },
        setTrack(state, action: PayloadAction<number>) {
            state.currentTrackId = action.payload;
            state.isPlaying = true;
        },
    },
});

export const { setQueue, nextTrack, prevTrack, setPlaying, setPaused, setTrack } = playerSlice.actions;
export default playerSlice.reducer;
