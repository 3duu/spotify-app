import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getCurrentUser, UserProfile } from '../services/api';

type HeaderProps = {
    sectionTitle: string;
};

export default function Header({ sectionTitle }: Readonly<HeaderProps>) {
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .catch(console.error);
    }, []);

    return (
        <View style={styles.container}>
            {user?.image ? (
                <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder} />
            )}
            <Text style={styles.title}>{sectionTitle}</Text>
        </View>
    );
}

const AVATAR_SIZE = 36;

const styles = StyleSheet.create({
    container: {
        height: 60,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: '#333',
        marginRight: 12,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});