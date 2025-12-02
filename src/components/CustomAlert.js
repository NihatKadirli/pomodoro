import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomAlert = ({
    visible,
    onClose,
    title,
    message,
    buttons = [],
    icon = null,
    type = 'default' // 'success', 'warning', 'error', 'info', 'default'
}) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Açılış animasyonu
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Kapanış animasyonu
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    // Tip'e göre renk ve ikon
    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    gradient: ['#4CAF50', '#45a049'],
                    icon: 'checkmark-circle',
                    iconColor: '#4CAF50',
                };
            case 'warning':
                return {
                    gradient: ['#FF9800', '#F57C00'],
                    icon: 'warning',
                    iconColor: '#FF9800',
                };
            case 'error':
                return {
                    gradient: ['#F44336', '#D32F2F'],
                    icon: 'close-circle',
                    iconColor: '#F44336',
                };
            case 'info':
                return {
                    gradient: ['#2d1206ff', '#da2519ff'],
                    icon: 'information-circle',
                    iconColor: '#da2519ff',
                };
            default:
                return {
                    gradient: ['#FF6B6B', '#FF8E53'],
                    icon: 'notifications',
                    iconColor: '#FF6B6B',
                };
        }
    };

    const config = getTypeConfig();
    const displayIcon = icon || config.icon;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View
                style={[
                    styles.overlay,
                    { opacity: fadeAnim }
                ]}
            >
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: fadeAnim,
                        }
                    ]}
                >
                    {/* İkon Başlık */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={config.gradient}
                            style={styles.iconGradient}
                        >
                            <Ionicons name={displayIcon} size={40} color="white" />
                        </LinearGradient>
                    </View>

                    {/* Başlık */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Mesaj */}
                    {message && <Text style={styles.message}>{message}</Text>}

                    {/* Butonlar */}
                    <View style={styles.buttonsContainer}>
                        {buttons.map((button, index) => {
                            const isCancel = button.style === 'cancel';
                            const isPrimary = !isCancel && index === buttons.length - 1;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        isCancel && styles.cancelButton,
                                        buttons.length === 1 && styles.singleButton,
                                    ]}
                                    onPress={() => {
                                        button.onPress && button.onPress();
                                        onClose();
                                    }}
                                >
                                    {isPrimary ? (
                                        <LinearGradient
                                            colors={config.gradient}
                                            style={styles.primaryButtonGradient}
                                        >
                                            <Text style={styles.primaryButtonText}>
                                                {button.text}
                                            </Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.secondaryButton}>
                                            <Text style={[
                                                styles.secondaryButtonText,
                                                { color: isCancel ? '#999' : config.iconColor }
                                            ]}>
                                                {button.text}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    alertContainer: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 16,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonsContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
    },
    singleButton: {
        marginTop: 8,
    },
    primaryButtonGradient: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    cancelButton: {
        opacity: 0.8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomAlert;
