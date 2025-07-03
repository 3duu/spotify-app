import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import { JSX } from 'react/jsx-runtime';
import {PLAYER_HEIGHT, TAB_BAR_HEIGHT} from "../constants/layout";

interface BodyProps {
    children: ReactNode;
    sectionTitle: string;
    userImage: string;
    playerVisible : boolean;
}

export default function Body({ children, sectionTitle, playerVisible }: Readonly<BodyProps>): JSX.Element {

    const contentPaddingBottom = playerVisible
        ? PLAYER_HEIGHT + 16
        : TAB_BAR_HEIGHT + 16; // less padding when player hidden

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header sectionTitle={sectionTitle} />

            {/* Main content */}
            <View style={[styles.content, { paddingBottom: contentPaddingBottom }]}>
                {children}
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