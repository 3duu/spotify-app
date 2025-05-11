import React, { ReactNode, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Sidebar from './Sidebar';
import Header from './Header';
import Player from './Player';

interface BodyProps {
    children: ReactNode;
}

const SIDEBAR_WIDTH = 230;

export default function Body({ children }: Readonly<BodyProps>) {
    const [showSidebar, setShowSidebar] = useState(false);
    const toggleSidebar = useCallback(() => setShowSidebar(v => !v), []);

    return (
        <View style={styles.container}>
            {/* Sidebar */}
            <View style={[
                styles.sidebar,
                showSidebar ? styles.sidebarOpen : styles.sidebarClosed
            ]}>
                <Sidebar sidebarState={toggleSidebar} />
            </View>

            {/* Main content area */}
            <View style={[
                styles.main,
                showSidebar && styles.mainShift
            ]}>
                <Header sidebarState={toggleSidebar} />
                <View style={styles.content}>
                    {children}
                </View>
            </View>

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
        flexDirection: 'row',
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: '#000',
        zIndex: 2,
    },
    sidebarOpen: {
        left: 0,
    },
    sidebarClosed: {
        left: -SIDEBAR_WIDTH,
    },
    main: {
        flex: 1,
        marginLeft: 0,
    },
    mainShift: {
        marginLeft: SIDEBAR_WIDTH,
    },
    content: {
        flex: 1,
        backgroundColor: '#121212',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#181818',
    },
});
