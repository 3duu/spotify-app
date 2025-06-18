import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

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

type TabParamList = {
    HomeTab:   undefined;
    SearchTab: undefined;
    LibraryTab:undefined;
};
const Tab = createBottomTabNavigator<TabParamList>();

// -------------- HOME STACK --------------
const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Home"        component={HomeScreen} />
            <HomeStack.Screen name="TrackList"   component={TrackListScreen} />
            <HomeStack.Screen name="TrackDetails"component={TrackDetails} />
            <HomeStack.Screen name="Playlist"    component={PlaylistScreen} />
            <HomeStack.Screen name="AddToPlaylist"  component={AddToPlaylistScreen} />
            <HomeStack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
            <HomeStack.Screen name="EditPlaylist"   component={EditPlaylistScreen} />
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

// -------------- APP ENTRY --------------
export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <View style={styles.appContainer}>
                    <Tab.Navigator
                        screenOptions={({ route }) => ({
                            headerShown: false,
                            tabBarStyle: { backgroundColor: '#000', height: 56 },
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
                        <Tab.Screen name="LibraryTab"component={LibraryStackScreen}options={{ title: 'Library' }} />
                    </Tab.Navigator>

                    {/* Persistent Player Footer, always above tabs */}
                    <View style={styles.footer}>
                        <Player />
                    </View>
                </View>
            </NavigationContainer>
        </Provider>
    );
}

const PLAYER_HEIGHT = 80;

const styles = StyleSheet.create({
    appContainer: { flex: 1 },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 56,               // tabBar height
        height: PLAYER_HEIGHT,
        backgroundColor: '#181818',
        zIndex: 10,
        elevation: 10,
    },
});
