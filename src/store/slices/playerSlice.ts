import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PlayerState {
    position: 0,
    duration: 0,
    queue:           number[];          // all queued track IDs
    index:           number;            // current index into that queue
    currentTrackId:  number | null;     // equals queue[index] or null if empty
    isPlaying:       boolean;           // playing vs paused
}

const initialState: PlayerState = {
    position: 0,
    duration: 0,
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

        setPlaying(state) { state.isPlaying = true; },
        setPaused(state) { state.isPlaying = false; },
        setPosition(state, action) { state.position = action.payload; },
        setDuration(state, action) { state.duration = action.payload; },

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
    setPosition,
    setDuration
} = playerSlice.actions;

export default playerSlice.reducer;
