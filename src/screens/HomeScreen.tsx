import React, {useEffect, useState} from 'react';
import Body from '../components/Body';
import HomeItems from '../components/HomeItems';
import { JSX } from 'react/jsx-runtime';

import { getCurrentUser, UserProfile } from "../services/api";
import {useAppSelector} from "../store";

export default function HomeScreen(): JSX.Element {
    const [user, setUser] = useState<UserProfile | null>(null);
    const playerVisible = useAppSelector(s => !!s.player.currentTrackId);

    useEffect(() => {
        getCurrentUser().then(setUser).catch(console.error);
    }, []);


    return (
        <Body
            playerVisible={playerVisible}
            sectionTitle="Home"
            userImage={user?.image ?? "https://via.placeholder.com/36"}
        >
            <HomeItems />
        </Body>
    );
}