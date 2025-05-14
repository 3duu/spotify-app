import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import TrackDetails from './src/screens/TrackDetails';
import SearchScreen from './src/screens/SearchScreen'; // placeholder or implement accordingly

export type RootStackParamList = {
    Home: undefined;
    TrackDetails: { id: string };
    Library: undefined;
};

const HomeStack = createNativeStackNavigator<RootStackParamList>();
function HomeStackScreen() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Home" component={HomeScreen} />
            <HomeStack.Screen name="TrackDetails" component={TrackDetails} options={{ headerShown: true, title: 'Now Playing' }} />
        </HomeStack.Navigator>
    );
}

const LibraryStack = createNativeStackNavigator<RootStackParamList>();
function LibraryStackScreen() {
    return (
        <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
            <LibraryStack.Screen name="Library" component={LibraryScreen} />
        </LibraryStack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

export default function App() {

    /*useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            shouldDuckAndroid: true,
            staysActiveInBackground: true,
            playThroughEarpieceAndroid: false,
        }).catch(console.warn);
    }, []);*/

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: { backgroundColor: '#000' },
                    tabBarActiveTintColor: '#1DB954',
                    tabBarInactiveTintColor: '#888',
                    tabBarIcon: ({ color, size }) => {
                        let iconName: keyof typeof MaterialIcons.glyphMap;
                        if (route.name === 'HomeTab') iconName = 'home';
                        else if (route.name === 'SearchTab') iconName = 'search';
                        else iconName = 'library-music';
                        return <MaterialIcons name={iconName} size={size} color={color} />;
                    }
                })}
            >
                <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Home' }} />
                <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: 'Search' }} />
                <Tab.Screen name="LibraryTab" component={LibraryStackScreen} options={{ title: 'Your Library' }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}