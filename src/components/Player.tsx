import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { playPause } from '../store/slices/playerSlice';

const Player = () => {
    const { isPlaying } = useAppSelector(state => state.player);
    const dispatch = useAppDispatch();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => dispatch(playPause())}>
                <Text style={styles.control}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'center', padding: 16 },
    control: { color: '#1DB954', fontSize: 18 }
});

export default Player;