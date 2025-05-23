import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PlayerState {
    queue:           number[];          // all queued track IDs
    index:           number;            // current index into that queue
    currentTrackId:  number | null;     // equals queue[index] or null if empty
    isPlaying:       boolean;           // playing vs paused
}

const initialState: PlayerState = {
    queue:          [],
    index:          0,
    currentTrackId: null,
    isPlaying:      false,
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        /** Replace the entire queue and reset to the first track */
        setQueue(state, action: PayloadAction<number[]>) {
            state.queue = action.payload;
            state.index = 0;
            state.currentTrackId = action.payload.length > 0 ? action.payload[0] : null;
            state.isPlaying = false;
        },

        /** Start playback (will be picked up by effect) */
        setPlaying(state) {
            state.isPlaying = true;
        },

        /** Pause playback */
        setPaused(state) {
            state.isPlaying = false;
        },

        /** Advance to the next track in the queue (or stop if at end) */
        nextTrack(state) {
            if (state.index < state.queue.length - 1) {
                state.index += 1;
                state.currentTrackId = state.queue[state.index];
                state.isPlaying = true;
            } else {
                // optionally loop here or just pause:
                state.isPlaying = false;
            }
        },

        /** Go back to the previous track in the queue */
        prevTrack(state) {
            if (state.index > 0) {
                state.index -= 1;
                state.currentTrackId = state.queue[state.index];
                state.isPlaying = true;
            }
        },

        /** Jump to any position in the queue */
        setIndex(state, action: PayloadAction<number>) {
            const idx = action.payload;
            if (idx >= 0 && idx < state.queue.length) {
                state.index = idx;
                state.currentTrackId = state.queue[idx];
                state.isPlaying = true;
            }
        },
    },
});

export const {
    setQueue,
    setPlaying,
    setPaused,
    nextTrack,
    prevTrack,
    setIndex,
} = playerSlice.actions;

export default playerSlice.reducer;
