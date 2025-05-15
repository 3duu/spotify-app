import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import Player from './Player';
import { JSX } from 'react/jsx-runtime';
import store from "../store";
import {Provider} from "react-redux";

interface BodyProps {
    children: ReactNode;
    sectionTitle: string;
    userImage: string;
}

const TAB_BAR_HEIGHT = 56;
const PLAYER_HEIGHT = 80;

export default function Body({ children, sectionTitle }: Readonly<BodyProps>): JSX.Element {
    return (
        <View style={styles.container}>
            {/* Header */}
            <Header sectionTitle={sectionTitle} />

            {/* Main content */}
            <View style={styles.content}>{children}</View>

            {/* Footer / Player bar */}
            <View style={styles.footer}>
                <Player />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        position: 'relative',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: PLAYER_HEIGHT + 16,
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: TAB_BAR_HEIGHT,
        height: PLAYER_HEIGHT,
        backgroundColor: '#181818',
        zIndex: 10,
        elevation: 10,
    },
});