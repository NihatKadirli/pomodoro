import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { PetAvatar } from './PetAvatar';
import { usePet } from '../../context/PetContext';

export const FocusPet = ({ size = 150, showStats = true }) => {
    const { activePet, patPet } = usePet();

    // Animasyon Değerleri
    const bounceAnim = useRef(new Animated.Value(0)).current;

    // Nefes Alma / Idle Animasyonu
    useEffect(() => {
        const breathe = Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        breathe.start();

        return () => breathe.stop();
    }, []);

    const handlePress = () => {
        // Zıplama Animasyonu (Pat)
        patPet();
        Animated.sequence([
            Animated.timing(bounceAnim, {
                toValue: -0.5, // Yukarı zıpla
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.spring(bounceAnim, {
                toValue: 0,
                friction: 4,
                useNativeDriver: true,
            })
        ]).start();
    };

    // Y ekseninde hareket oluştur (Nefes alma efekti için scale veya translateY)
    const translateY = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10] // Hafifçe yukarı aşağı süzülme
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <Animated.View style={{ transform: [{ translateY }, { scale: activePet.scale }] }}>
                    <PetAvatar
                        type={activePet.id}
                        colors={activePet.colors}
                    />
                </Animated.View>
            </TouchableOpacity>

            {showStats && (
                <View style={styles.statsBadge}>
                    <Text style={styles.levelText}>Lvl {activePet.level}</Text>
                    <View style={styles.xpBarBg}>
                        <View style={[styles.xpBarFill, { width: `${activePet.levelProgress}%` }]} />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    statsBadge: {
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center',
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 4,
    },
    xpBarBg: {
        width: 60,
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
    }
});
