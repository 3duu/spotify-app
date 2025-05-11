import React from 'react';
import Body from '../components/Body';
import LibraryItems from '../components/LibraryItems';

export default function LibraryScreen() {
    return (
        <Body sectionTitle="Your Library" userImage="https://via.placeholder.com/36">
            <LibraryItems />
        </Body>
    );
}
