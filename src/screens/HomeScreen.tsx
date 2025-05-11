import React from 'react';
import Body from '../components/Body';
import HomeItems from '../components/HomeItems';
import { JSX } from 'react/jsx-runtime';

export default function HomeScreen(): JSX.Element {
    const userImage = 'https://via.placeholder.com/36';
    return (
        <Body sectionTitle="Início" userImage={userImage}>
            <HomeItems />
        </Body>
    );
}