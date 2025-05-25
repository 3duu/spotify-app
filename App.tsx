import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
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

export type RootStackParamList = {
    Main:                  undefined;
    TrackDetails:          { id: number; playlistId?: number, origin : string, originId? : number };
    Playlist:              { playlistId: number, title?: string };
    AddToPlaylist:         { trackId: number };
    CreatePlaylist:        { trackId?: number };
    EditPlaylist: { playlistId: number };
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
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <NavigationContainer>
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
                        </RootStack.Group>
                    </RootStack.Navigator>
                </NavigationContainer>
            </Provider>
        </GestureHandlerRootView>
    );
}
