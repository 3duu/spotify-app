import React from 'react';
import Body from '../components/Body';
import LibraryItems from '../components/LibraryItems';
import {useAppSelector} from "../store";

export default function LibraryScreen() {

    const playerVisible = useAppSelector(s => !!s.player.currentTrackId);

    return (
        <Body sectionTitle="Your Library" userImage="https://via.placeholder.com/36" playerVisible={playerVisible}>
            <LibraryItems />
        </Body>
    );
}
