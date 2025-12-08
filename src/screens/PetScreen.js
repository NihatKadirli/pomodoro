import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Navigation
import { useTheme } from '../context/ThemeContext';
import { usePet } from '../context/PetContext';
import { FocusPet } from '../components/pet/FocusPet';
import { PET_TYPES } from '../constants/petTypes';
import CustomAlert from '../components/CustomAlert'; // Custom Alert
import { useCustomAlert } from '../hooks/useCustomAlert'; // Hook

const { width } = Dimensions.get('window');

const PetScreen = () => {
    const { theme } = useTheme();
    const { petState, activePet, changeActivePet, feedPet, patPet } = usePet();
    const navigation = useNavigation();
    const { showAlert, hideAlert, alertConfig } = useCustomAlert();

    // Pet statlarını hesapla ve göster
    const renderStatBar = (label, value, color, max = 100, icon) => (
        <View style={styles.statRow}>
            <View style={styles.statLabelContainer}>
                <Ionicons name={icon} size={18} color={color} style={{ marginRight: 6 }} />
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>{label}</Text>
            </View>
            <View style={styles.statBarContainer}>
                <View style={[styles.statBarBg, { backgroundColor: theme.colors.border }]}>
                    <View
                        style={[
                            styles.statBarFill,
                            {
                                width: `${(value / max) * 100}%`,
                                backgroundColor: color
                            }
                        ]}
                    />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.subText }]}>{Math.floor(value)}/{max}</Text>
            </View>
        </View>
    );

    const handleFeed = () => {
        const success = feedPet();
        if (success) {
            // Başarılı feed animasyonu gerekirse eklenebilir
        } else {
            // başarısız - yemek bitti
            showAlert({
                title: 'Yemek Bitti! 🍎',
                message: 'Stok yapmak için 1 dakika odaklanmalısın. Şimdi çalışmaya başlamak ister misin?',
                type: 'warning',
                buttons: [
                    {
                        text: 'Daha Sonra',
                        style: 'cancel'
                    },
                    {
                        text: 'Çalışmaya Başla',
                        onPress: () => navigation.navigate('Zamanlayıcı') // Yönlendirme
                    }
                ]
            });
        }
    };

    const handlePat = () => {
        const success = patPet();
        if (success) {
            // Başarılı sevme
        } else {
            // Başarısız - sevgi hakkı bitti
            showAlert({
                title: 'Enerjin Kalmadı! ⚡',
                message: 'Petini sevmek için enerji toplamalısın. 1 dakika odaklanarak enerji kazanabilirsin!',
                type: 'warning',
                buttons: [
                    {
                        text: 'Daha Sonra',
                        style: 'cancel'
                    },
                    {
                        text: 'Enerji Topla',
                        onPress: () => navigation.navigate('Zamanlayıcı') // Yönlendirme
                    }
                ]
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={theme.gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.headerTitle}>Odak Dostum</Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Ana Pet Görünümü */}
                <View style={[styles.petDisplayCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.levelBadge}>
                        <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.levelBadgeGradient}>
                            <Text style={styles.levelText}>{activePet.currentLevelTitle}</Text>
                            <Text style={styles.levelNumber}>Lv. {activePet.level}</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.petWrapper}>
                        <FocusPet size={180} showStats={false} />
                    </View>

                    <Text style={[styles.petName, { color: theme.colors.text }]}>
                        {activePet.name}
                    </Text>

                    <Text style={[styles.petDesc, { color: theme.colors.subText }]}>
                        "{PET_TYPES[activePet.id.toUpperCase()].description}"
                    </Text>
                </View>

                {/* İstatistikler */}
                <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Durum</Text>

                    {renderStatBar('Mutluluk', activePet.happiness, '#E91E63', 100, 'heart')}
                    {renderStatBar('Sağlık', activePet.health, '#4CAF50', 100, 'fitness')}

                    {/* XP Bar */}
                    <View style={styles.xpInfoContainer}>
                        <View style={styles.rowBetween}>
                            <Text style={[styles.xpText, { color: theme.colors.text }]}>XP İlerlemesi</Text>
                            <Text style={[styles.xpValue, { color: theme.colors.primary }]}>
                                {Math.floor(activePet.xp)} / {activePet.nextLevelXp} XP
                            </Text>
                        </View>
                        <View style={[styles.statBarBg, { height: 10, marginTop: 8, backgroundColor: theme.colors.border }]}>
                            <LinearGradient
                                colors={theme.gradient}
                                style={[styles.statBarFill, { width: `${activePet.levelProgress}%` }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </View>
                        <Text style={[styles.nextLevelText, { color: theme.colors.subText }]}>
                            Sonraki seviyeye {activePet.nextLevelXp - Math.floor(activePet.xp)} XP kaldı
                        </Text>
                    </View>
                </View>

                {/* Aksiyonlar */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={handleFeed}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="fast-food" size={24} color="#FF9800" />
                        </View>
                        <View>
                            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Besle</Text>
                            <Text style={{ fontSize: 10, color: theme.colors.subText }}>+10 Mutluluk</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{petState.inventory?.food || 0}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={handlePat}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: '#FCE4EC' }]}>
                            <Ionicons name="hand-left" size={24} color="#E91E63" />
                        </View>
                        <View>
                            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Sev</Text>
                            <Text style={{ fontSize: 10, color: theme.colors.subText }}>+10 Mutluluk</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: '#E91E63' }]}>
                            <Text style={styles.badgeText}>{petState.inventory?.love || 0}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Pet Koleksiyonu */}
                <View style={[styles.collectionContainer, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 16 }]}>Koleksiyon</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
                        {Object.values(PET_TYPES).map((petType) => {
                            const isUnlocked = petState.pets[petType.id]?.unlocked;
                            const isActive = activePet.id === petType.id;

                            return (
                                <TouchableOpacity
                                    key={petType.id}
                                    style={[
                                        styles.petOption,
                                        {
                                            backgroundColor: isActive ? theme.colors.primary + '15' : theme.colors.background,
                                            borderColor: isActive ? theme.colors.primary : theme.colors.border
                                        }
                                    ]}
                                    onPress={() => {
                                        if (isUnlocked) {
                                            changeActivePet(petType.id);
                                        } else {
                                            showAlert({
                                                title: 'Henüz Açılmadı 🔒',
                                                message: `Bu dostumuzun kilidini açmak için toplam ${petType.unlockMinutes} dakika odaklanmalısın.`,
                                                type: 'info'
                                            });
                                        }
                                    }}
                                >
                                    <View style={[styles.petIconContainer, !isUnlocked && styles.lockedPet]}>
                                        <Text style={{ fontSize: 32 }}>{petType.icon}</Text>
                                        {!isUnlocked && (
                                            <View style={styles.lockOverlay}>
                                                <Ionicons name="lock-closed" size={20} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.petOptionName, { color: theme.colors.text, fontWeight: isActive ? 'bold' : 'normal' }]}>
                                        {petType.name}
                                    </Text>
                                    {!isUnlocked && (
                                        <Text style={{ fontSize: 10, color: theme.colors.subText, marginTop: 4 }}>
                                            {petType.unlockMinutes} dk
                                        </Text>
                                    )}
                                    {isActive && (
                                        <View style={[styles.activeBadge, { backgroundColor: theme.colors.primary }]}>
                                            <Ionicons name="checkmark" size={10} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

            </ScrollView>

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                onClose={hideAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                icon={alertConfig.icon}
                type={alertConfig.type}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    petDisplayCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'visible',
    },
    levelBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    levelBadgeGradient: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
    },
    levelText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    levelNumber: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    petWrapper: {
        marginVertical: 10,
    },
    petName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    petDesc: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 4,
        textAlign: 'center',
    },
    statsCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 100,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    statBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statBarBg: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    statBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    statValue: {
        fontSize: 12,
        width: 50,
        textAlign: 'right',
    },
    xpInfoContainer: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    xpText: {
        fontSize: 14,
        fontWeight: '600',
    },
    xpValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    nextLevelText: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'right',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    actionIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF5252',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    collectionContainer: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    petOption: {
        borderRadius: 16,
        borderWidth: 2,
        padding: 12,
        alignItems: 'center',
        marginRight: 12,
        width: 100,
    },
    petIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    lockedPet: {
        opacity: 0.5,
        backgroundColor: '#000',
    },
    lockOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
    },
    petOptionName: {
        fontSize: 12,
        textAlign: 'center',
    },
    activeBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PetScreen;
