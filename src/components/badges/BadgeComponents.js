import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useBadges } from '../../context/BadgeContext';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

// --- 1. KUTLAMA MODALI ---
export const BadgeUnlockModal = () => {
    const { newlyUnlockedBadge, clearNewBadge } = useBadges();
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (newlyUnlockedBadge) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [newlyUnlockedBadge]);

    if (!newlyUnlockedBadge) return null;

    return (
        <Modal transparent visible={!!newlyUnlockedBadge} animationType="fade">
            <View style={styles.modalOverlay}>
                <ConfettiCannon count={200} origin={{ x: width / 2, y: 0 }} fadeOut={true} />
                <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }], backgroundColor: theme.colors.card }]}>
                    <LinearGradient
                        colors={[newlyUnlockedBadge.color + '40', 'transparent']}
                        style={styles.modalGradient}
                    />
                    <Text style={styles.modalEmoji}>{newlyUnlockedBadge.icon}</Text>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>ROZET KAZANDIN!</Text>
                    <Text style={[styles.badgeName, { color: newlyUnlockedBadge.color }]}>{newlyUnlockedBadge.title}</Text>
                    <Text style={[styles.badgeDesc, { color: theme.colors.subText }]}>{newlyUnlockedBadge.description}</Text>

                    <TouchableOpacity
                        style={[styles.awesomeButton, { backgroundColor: newlyUnlockedBadge.color }]}
                        onPress={clearNewBadge}
                    >
                        <Text style={styles.awesomeText}>Harika! 🤩</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

// --- 2. ROZET KARTI (Tekil Eleman) ---
const BadgeCard = ({ badge, isUnlocked, onPress }) => {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.badgeCard, !isUnlocked && styles.lockedCard, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.iconCircle, { backgroundColor: isUnlocked ? badge.color + '20' : '#ccc' }]}>
                {isUnlocked ? (
                    <Text style={styles.smallEmoji}>{badge.icon}</Text>
                ) : (
                    <Ionicons name="lock-closed" size={20} color="#999" />
                )}
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>{badge.title}</Text>
        </TouchableOpacity>
    );
};

// --- 3. RAPORLAR BÖLÜMÜ (Yatay Liste) ---
export const BadgeSection = ({ onViewAll }) => {
    const { unlockedBadges, allBadges } = useBadges();
    const { theme } = useTheme();

    // Kazanılan son 5 rozeti bul (Ters çevir)
    const recentBadges = allBadges
        .filter(b => unlockedBadges.includes(b.id))
        .reverse()
        .slice(0, 5);

    const progressPercent = Math.round((unlockedBadges.length / allBadges.length) * 100);

    return (
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🏆 Başarılarım</Text>
                    <Text style={[styles.subTitle, { color: theme.colors.subText }]}>
                        {unlockedBadges.length}/{allBadges.length} Kazanıldı
                    </Text>
                </View>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={[styles.linkText, { color: theme.colors.primary }]}>Tümünü Gör</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.colors.accent }]} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
                {recentBadges.length > 0 ? (
                    recentBadges.map(badge => (
                        <BadgeCard key={badge.id} badge={badge} isUnlocked={true} onPress={onViewAll} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={{ color: theme.colors.subText }}>Henüz rozet kazanılmadı. Çalışmaya başla! 💪</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// --- 4. ROZET GALERİSİ (Full Modal) ---
export const BadgeGallery = ({ visible, onClose }) => {
    const { allBadges, unlockedBadges, resetBadges } = useBadges();
    const { theme } = useTheme();

    // Sadece Debug İçin (Normal kullanıcılarda bu buton gizlenebilir)
    const handleReset = () => {
        resetBadges();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.galleryContainer, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.galleryHeader, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.galleryTitle, { color: theme.colors.text }]}>Tüm Rozetler</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.gridContainer}>
                    {allBadges.map(badge => {
                        const isUnlocked = unlockedBadges.includes(badge.id);
                        return (
                            <View key={badge.id} style={[styles.largeCard, { backgroundColor: theme.colors.card, opacity: isUnlocked ? 1 : 0.6 }]}>
                                <View style={[styles.largeIconCircle, { backgroundColor: isUnlocked ? badge.color + '20' : '#eee' }]}>
                                    {isUnlocked ? (
                                        <Text style={styles.largeEmoji}>{badge.icon}</Text>
                                    ) : (
                                        <Ionicons name="lock-closed" size={32} color="#999" />
                                    )}
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.largeCardTitle, { color: theme.colors.text }]}>{badge.title}</Text>
                                    <Text style={[styles.largeCardDesc, { color: theme.colors.subText }]}>{badge.description}</Text>
                                    {/* Progress göstergesi eklenebilir buraya */}
                                </View>
                                {isUnlocked && (
                                    <View style={styles.checkBadge}>
                                        <Ionicons name="checkmark-circle" size={24} color={badge.color} />
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {/* Debug Reset Butonu */}
                    <TouchableOpacity onPress={handleReset} style={{ marginTop: 40, alignItems: 'center' }}>
                        <Text style={{ color: '#F44336', textDecorationLine: 'underline' }}>Demo Reset (Rozetleri Sıfırla)</Text>
                    </TouchableOpacity>
                    <View style={{ height: 50 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.85,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        overflow: 'hidden',
    },
    modalGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    modalEmoji: {
        fontSize: 80,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
        letterSpacing: 1,
    },
    badgeName: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
    },
    badgeDesc: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    awesomeButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
    },
    awesomeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },

    // Inline Section Styles
    sectionContainer: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 12,
        marginTop: 2,
    },
    linkText: {
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        marginBottom: 15,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    scrollList: {
        paddingRight: 20,
    },
    emptyState: {
        padding: 10,
    },

    // Mini Cards
    badgeCard: {
        marginRight: 15,
        alignItems: 'center',
        width: 80,
    },
    lockedCard: {
        opacity: 0.7,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    smallEmoji: {
        fontSize: 28,
    },
    cardTitle: {
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Gallery Modal
    galleryContainer: {
        flex: 1,
    },
    galleryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    galleryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    gridContainer: {
        padding: 20,
    },
    largeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        marginBottom: 15,
        elevation: 2,
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    largeIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    largeEmoji: {
        fontSize: 32,
    },
    cardInfo: {
        flex: 1,
    },
    largeCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    largeCardDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    checkBadge: {
        marginLeft: 10,
    }
});
