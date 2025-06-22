import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import {NavigationContainer, useNavigationState} from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import store from './src/store';
import Player from './src/components/Player';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import TrackListScreen  from './src/screens/TrackListScreen';
import TrackDetails     from './src/screens/TrackDetails';
import PlaylistScreen   from './src/screens/PlaylistScreen';
import AddToPlaylistScreen  from './src/screens/AddToPlaylistScreen';
import CreatePlaylistScreen from './src/screens/CreatePlaylistScreen';
import EditPlaylistScreen   from './src/screens/EditPlaylistScreen';
import {TrackMeta} from "./src/services/api";
import {
  SafeAreaProvider,
      SafeAreaView,
      useSafeAreaInsets,
    } from 'react-native-safe-area-context';

type TabParamList = {
    HomeTab:   undefined;
    SearchTab: undefined;
    LibraryTab:undefined;
};

export type RootStackParamList = {
    TrackDetails: {
        id: number;
        origin?: 'playlist'|'album'|'artist'|'search'|'home';
        originId?: string | number;
        originTitle?: string;
        playlistId?: number;
        audio?: TrackMeta;
    };
    AddToPlaylist: { trackId: number };
    EditPlaylist: { playlistId: number };
    TrackList: { mode: 'playlist' | 'album' | 'artist'; id: number, title?: string };
    CreatePlaylist: { trackId: number };
    Library: undefined;
    Home: undefined;
    Search: { query?: string };
    Playlist: { playlistId: number };
};

const Tab = createBottomTabNavigator<TabParamList>();

// -------------- HOME STACK --------------
const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Home"        component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="TrackList"   component={TrackListScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="TrackDetails"component={TrackDetails} options={{ headerShown: false }} />
            <HomeStack.Screen name="Playlist"    component={PlaylistScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="AddToPlaylist"  component={AddToPlaylistScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="EditPlaylist"   component={EditPlaylistScreen} options={{ headerShown: false }} />
        </HomeStack.Navigator>
    );
}

// ------------- SEARCH STACK -------------
const SearchStack = createNativeStackNavigator();
function SearchStackScreen() {
    return (
        <SearchStack.Navigator screenOptions={{ headerShown: false }}>
            <SearchStack.Screen name="Search"      component={SearchScreen} />
            <SearchStack.Screen name="TrackList"   component={TrackListScreen} />
            <SearchStack.Screen name="TrackDetails"component={TrackDetails} />
            <SearchStack.Screen name="Playlist"    component={PlaylistScreen} />
            <SearchStack.Screen name="AddToPlaylist"  component={AddToPlaylistScreen} />
            <SearchStack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
            <SearchStack.Screen name="EditPlaylist"   component={EditPlaylistScreen} />
        </SearchStack.Navigator>
    );
}

// ----------- LIBRARY STACK ------------
const LibraryStack = createNativeStackNavigator();
function LibraryStackScreen() {
    return (
        <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
            <LibraryStack.Screen name="Library"     component={LibraryScreen} />
            <LibraryStack.Screen name="TrackList"   component={TrackListScreen} />
            <LibraryStack.Screen name="TrackDetails"component={TrackDetails} />
            <LibraryStack.Screen name="Playlist"    component={PlaylistScreen} />
            <LibraryStack.Screen name="AddToPlaylist"  component={AddToPlaylistScreen} />
            <LibraryStack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
            <LibraryStack.Screen name="EditPlaylist"   component={EditPlaylistScreen} />
        </LibraryStack.Navigator>
    );
}

export default function App() {
    // insets.top = notch/statusbar height
    // insets.bottom = home-indicator / soft-buttons height
    return (
        <SafeAreaProvider>
            <Provider store={store}>
                <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </SafeAreaView>
            </Provider>
        </SafeAreaProvider>
    );
}

function AppNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.appContainer}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    // move header down by insets.top
                    headerStyle: {
                        paddingTop: insets.top,
                        height: 56 + insets.top,
                        backgroundColor: '#000',
                    },
                    headerTitleStyle: { color: '#fff' },

                    // enlarge tabBar to account for insets.bottom
                    tabBarStyle: {
                        height: 56 + insets.bottom,
                        paddingBottom: insets.bottom,
                        backgroundColor: '#000',
                    },
                    tabBarActiveTintColor: '#1DB954',
                    tabBarInactiveTintColor: '#888',
                    tabBarIcon: ({ color, size }) => {
                        let iconName: keyof typeof MaterialIcons.glyphMap;
                        if (route.name === 'HomeTab')    iconName = 'home';
                        else if (route.name === 'SearchTab') iconName = 'search';
                        else                                iconName = 'library-music';
                        return <MaterialIcons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="HomeTab"   component={HomeStackScreen}   options={{ title: 'Home'    }} />
                <Tab.Screen name="SearchTab" component={SearchStackScreen} options={{ title: 'Search'  }} />
                <Tab.Screen name="LibraryTab" component={LibraryStackScreen} options={{ title: 'Library' }} />
            </Tab.Navigator>

            {/* absolutely positioned Player above tabBar */}
            <View style={[
                styles.footer,
                { bottom: 56 + insets.bottom }
            ]}
            >
                <Player />
            </View>
        </View>
    );
}

// ---------------- FooterPlayer ----------------
function FooterPlayer() {
    // grab the top-level nav state
    const navState = useNavigationState(state => state);
    if (!navState) {
        // not ready yet — render an empty footer so Player stays mounted
        return <View style={styles.footer}><Player /></View>;
    }

    // begin at the active tab...
    let route = navState.routes[navState.index];

    // ...and walk down into nested navigators until there's no more .state
    while (route.state && Array.isArray((route.state as any).routes)) {
        const nested = route.state as typeof navState;
        route = nested.routes[nested.index];
    }

    // now `route.name` is the deepest screen
    const activeName = route.name;
    const isDetails = activeName === 'TrackDetails';

    // render the footer container _always_, but collapse it on TrackDetails
    return (
        <View
            style={[styles.footer, isDetails && styles.footerCollapsed]}
            pointerEvents={isDetails ? 'none' : 'auto'}
        >
            <Player />
        </View>
    );
}

const PLAYER_HEIGHT = 80;

const styles = StyleSheet.create({
    flex:        { flex: 1 },
    appContainer: { flex: 1 },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        // we’ll set `bottom` dynamically via insets
        height: 80,               // your player height
        backgroundColor: '#181818',
        zIndex: 10,
        elevation: 10,
    },
    footerCollapsed: {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
    },
});
