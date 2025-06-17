import React, {useRef, useState} from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {
    createBottomTabNavigator
} from '@react-navigation/bottom-tabs';
import {
    createNativeStackNavigator
} from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Provider } from 'react-redux';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import TrackDetails   from './src/screens/TrackDetails';
import PlaylistScreen from './src/screens/PlaylistScreen';
import AddToPlaylistScreen   from './src/screens/AddToPlaylistScreen';
import CreatePlaylistScreen  from './src/screens/CreatePlaylistScreen';

import store from './src/store';
import EditPlaylistScreen from "./src/screens/EditPlaylistScreen";
import TrackListScreen, {TrackListMode} from "./src/screens/TrackListScreen";
import {TrackMeta} from "./src/services/api";
import Player from "./src/components/Player";
import {View, StyleSheet } from "react-native";

export type RootStackParamList = {
    Main:                  undefined;
    TrackDetails:          { id: number; playlistId?: number, origin? : string, originId? : number, audio? : TrackMeta };
    Playlist:              { playlistId: number, title?: string };
    AddToPlaylist:         { trackId: number };
    CreatePlaylist:        { trackId?: number };
    EditPlaylist: { playlistId: number };
    TrackList: { mode: TrackListMode; id: number, title?: string };
    Search:                undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export type MainTabParamList = {
    HomeTab:    undefined;
    SearchTab:  undefined;
    LibraryTab: undefined;
    TrackDetailsTab: { id: number; playlistId?: number };
    PlaylistTab: { id: number };
};
const Tab = createBottomTabNavigator<MainTabParamList>();


function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: { backgroundColor: '#000' },
                tabBarActiveTintColor: '#1DB954',
                tabBarInactiveTintColor: '#888',
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof MaterialIcons.glyphMap;

                    if (route.name === 'HomeTab')    iconName = 'home';
                    else if (route.name === 'SearchTab')  iconName = 'search';
                    else                                 iconName = 'library-music';

                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="HomeTab"    component={HomeScreen}    options={{ title: 'Home' }} />
            <Tab.Screen name="SearchTab"  component={SearchScreen}  options={{ title: 'Search' }} />
            <Tab.Screen name="LibraryTab" component={LibraryScreen} options={{ title: 'Your Library' }} />
        </Tab.Navigator>
    );
}

//
// 4) Root navigator (MainTabs + modals)
//
export default function App() {

    const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
    // track the current route name
    const [currentRoute, setCurrentRoute] = useState<string>('');

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <NavigationContainer
                    ref={navRef}
                    onReady={() =>
                        setCurrentRoute(navRef.current?.getCurrentRoute()?.name ?? '')
                    }
                    onStateChange={() =>
                        setCurrentRoute(navRef.current?.getCurrentRoute()?.name ?? '')
                    }
                >
                    <View style={styles.appContainer}>
                        <RootStack.Navigator screenOptions={{ headerShown: false }}>
                        {/* Main tabs */}
                        <RootStack.Screen name="Main" component={MainTabs} />

                        {/* These will slide up as modals */}
                        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
                            <RootStack.Screen
                                name="Playlist"
                                component={PlaylistScreen}
                                options={{ headerShown: true, title: 'Playlist' }}
                            />
                            <RootStack.Screen
                                name="AddToPlaylist"
                                component={AddToPlaylistScreen}
                                options={{
                                    headerShown: false,
                                    // you can also add a custom transition if you like
                                }}
                            />
                            <RootStack.Screen
                                name="CreatePlaylist"
                                component={CreatePlaylistScreen}
                                options={{
                                    headerShown: false,
                                }}
                            />
                            <RootStack.Screen
                                name="TrackDetails"
                                component={TrackDetails}
                                options={{ headerShown: true, title: 'Now Playing' }}
                            />
                          <RootStack.Screen
                            name="EditPlaylist"
                            component={EditPlaylistScreen}
                            options={{ headerShown:false }}
                          />

                          <RootStack.Screen
                            name="TrackList"
                            component={TrackListScreen}
                            options={({ route }) => ({
                              headerShown: true,
                              title: {
                                playlist: 'Playlist',
                                album:    'Album',
                                artist:   'Artist',
                              }[route.params.mode],
                            })}
                          />
                        </RootStack.Group>
                    </RootStack.Navigator>


                        {/* ── Persistent Player Footer ─────────────────── */}
                        {currentRoute !== 'TrackDetails' && (
                            <View style={styles.footer}>
                                <Player />
                            </View>
                        )}
                    </View>
                </NavigationContainer>
            </Provider>
        </GestureHandlerRootView>
    );
}

// match your Body.tsx constants
const TAB_BAR_HEIGHT = 80;
const PLAYER_HEIGHT = 80;

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
        position: 'relative',
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
