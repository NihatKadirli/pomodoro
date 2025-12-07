import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { MOTIVATION_MESSAGES } from '../constants/motivationMessages';

const getPhase = (progress) => {
    if (progress >= 0.75) return 'almostDone';
    if (progress >= 0.5) return 'final';
    if (progress >= 0.25) return 'middle';
    return 'start';
};

const MotivationBanner = ({ progress, isActive, distractionCount }) => {
    const [currentMessage, setCurrentMessage] = useState(null);
    const [lastPhase, setLastPhase] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        if (!isActive) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
            return;
        }

        const phase = getPhase(progress);
        const isDistraction = distractionCount > 0 && Math.random() < 0.3;

        if (phase !== lastPhase || isDistraction) {
            const category = isDistraction ? 'afterDistraction' : phase;
            const msgs = MOTIVATION_MESSAGES[category];
            const random = msgs[Math.floor(Math.random() * msgs.length)];

            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 10, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setCurrentMessage(random);
                setLastPhase(phase);
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.spring(translateY, { toValue: 0, friction: 6, useNativeDriver: true })
                ]).start();
            });
        }
    }, [progress, isActive, distractionCount]);

    if (!isActive || !currentMessage) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
        >
            <View style={styles.bubble}>
                <Text style={styles.emoji}>{currentMessage.emoji}</Text>
                <Text style={styles.message}>{currentMessage.message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginVertical: 8,
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fdc6c6ff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        maxWidth: '90%',
    },
    emoji: {
        fontSize: 18,
        marginRight: 8,
    },
    message: {
        color: '#4B5563',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        flex: 1,
    },
});

export default MotivationBanner;
