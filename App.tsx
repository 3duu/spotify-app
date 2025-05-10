import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import store from './src/store';
import HomeScreen from './src/screens/HomeScreen';
import TrackDetails from './src/screens/TrackDetails';

export type RootStackParamList = { Home: undefined; TrackDetails: { id: string } };
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#1DB954' }}>
                    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Spotify Clone' }} />
                    <Stack.Screen name="TrackDetails" component={TrackDetails} options={{ title: 'Now Playing' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
}