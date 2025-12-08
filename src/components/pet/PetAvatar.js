import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Bu bileşen harici SVG kütüphanesi KULLANMADAN,
 * sadece React Native View ve sitillerini kullanarak "CSS Sanatı" tarzında
 * petleri çizer. Bu sayede 'react-native-svg' kurulumu gerektirmez.
 */

const CatAvatar = ({ color, eyes, scale }) => (
    <View style={[styles.avatarContainer, { transform: [{ scale }] }]}>
        {/* Kulaklar */}
        <View style={[styles.ear, styles.earLeft, { borderBottomColor: color }]} />
        <View style={[styles.ear, styles.earRight, { borderBottomColor: color }]} />

        {/* Kafa/Gövde */}
        <View style={[styles.body, { backgroundColor: color }]}>
            {/* Gözler */}
            <View style={[styles.eye, styles.eyeLeft, { backgroundColor: eyes }]} />
            <View style={[styles.eye, styles.eyeRight, { backgroundColor: eyes }]} />

            {/* Burun */}
            <View style={styles.nose} />

            {/* Göbek */}
            <View style={styles.belly} />
        </View>
    </View>
);

const DogAvatar = ({ color, eyes, scale }) => (
    <View style={[styles.avatarContainer, { transform: [{ scale }] }]}>
        {/* Kulaklar (Sarkık) */}
        <View style={[styles.dogEar, styles.dogEarLeft, { backgroundColor: color }]} />
        <View style={[styles.dogEar, styles.dogEarRight, { backgroundColor: color }]} />

        {/* Kafa */}
        <View style={[styles.body, { backgroundColor: color, borderRadius: 35 }]}>
            <View style={[styles.eye, styles.eyeLeft, { backgroundColor: eyes }]} />
            <View style={[styles.eye, styles.eyeRight, { backgroundColor: eyes }]} />
            <View style={[styles.nose, { backgroundColor: '#3E2723', width: 12, height: 8, borderRadius: 4 }]} />
        </View>
    </View>
);

// Diğer petler için placeholder şekiller (Basit tutuldu)
const SimpleGhost = ({ color, scale }) => (
    <View style={[styles.avatarContainer, { transform: [{ scale }] }]}>
        <View style={[styles.body, { backgroundColor: color, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }]}>
            <View style={[styles.eye, styles.eyeLeft, { backgroundColor: '#fff' }]} />
            <View style={[styles.eye, styles.eyeRight, { backgroundColor: '#fff' }]} />
        </View>
    </View>
);

export const PetAvatar = ({ type, colors, scale = 1.0 }) => {
    switch (type) {
        case 'cat':
            return <CatAvatar color={colors.body} eyes={colors.eyes} scale={scale} />;
        case 'dog':
            return <DogAvatar color={colors.body} eyes={colors.eyes} scale={scale} />;
        default:
            return <SimpleGhost color={colors.body} scale={scale} />;
    }
};

const styles = StyleSheet.create({
    avatarContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Ortak
    body: {
        width: 70,
        height: 60,
        borderRadius: 30, // Yuvarlakımsı
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    eye: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 20,
    },
    eyeLeft: { left: 18 },
    eyeRight: { right: 18 },
    nose: {
        width: 6,
        height: 4,
        backgroundColor: '#FFAB91',
        borderRadius: 2,
        position: 'absolute',
        top: 32,
    },
    belly: {
        width: 30,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 15,
        position: 'absolute',
        bottom: 5,
    },
    // Kedi Kulakları (Üçgen css trick)
    ear: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        position: 'absolute',
        top: 10, // Kafanın biraz üstünde
        zIndex: 1,
    },
    earLeft: { left: 15, transform: [{ rotate: '-15deg' }] },
    earRight: { right: 15, transform: [{ rotate: '15deg' }] },
    // Köpek Kulakları
    dogEar: {
        width: 20,
        height: 25,
        borderRadius: 10,
        position: 'absolute',
        top: 20,
        zIndex: 3,
    },
    dogEarLeft: { left: 5, transform: [{ rotate: '-20deg' }] },
    dogEarRight: { right: 5, transform: [{ rotate: '20deg' }] },
});
