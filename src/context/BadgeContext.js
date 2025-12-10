import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { BADGE_DEFINITIONS } from '../data/badgeDefinitions';

const BadgeContext = createContext();

export const useBadges = () => useContext(BadgeContext);

export const BadgeProvider = ({ children }) => {
    const [unlockedBadges, setUnlockedBadges] = useState([]); // Kazanılan rozet ID'leri
    const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null); // Modal için son kazanılan
    const [stats, setStats] = useState({}); // Anlık istatistikler

    // Uygulama açılışında kayıtlı rozetleri yükle
    useEffect(() => {
        loadBadges();
    }, []);

    const loadBadges = async () => {
        try {
            const storedBadges = await AsyncStorage.getItem('@pomodoro_badges');
            if (storedBadges) {
                setUnlockedBadges(JSON.parse(storedBadges));
            }
        } catch (e) {
            console.error('Rozetler yüklenemedi', e);
        }
    };

    // İstatistikleri güncelle ve rozetleri kontrol et
    const checkBadges = useCallback((currentStats) => {
        setStats(currentStats); // Stats güncelle
        let newUnlock = false;

        const updatedUnlockedBadges = [...unlockedBadges];

        BADGE_DEFINITIONS.forEach(badge => {
            // Zaten kazanılmışsa atla
            if (updatedUnlockedBadges.includes(badge.id)) return;

            let isUnlocked = false;

            // 1. Sayaç bazlı kontrol (Örn: totalPomodoros >= 5)
            if (badge.statKey && badge.targetValue) {
                if (currentStats[badge.statKey] >= badge.targetValue) {
                    isUnlocked = true;
                }
            }

            // 2. Fonksiyon bazlı kontrol (Örn: Zaman aralığı)
            if (badge.checkFunction) {
                if (badge.checkFunction(currentStats)) {
                    isUnlocked = true;
                }
            }

            if (isUnlocked) {
                updatedUnlockedBadges.push(badge.id);
                setNewlyUnlockedBadge(badge); // Modal'ı tetikle
                newUnlock = true;

                // Titreşim ve ses efekti (Sembolik)
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        });

        if (newUnlock) {
            setUnlockedBadges(updatedUnlockedBadges);
            AsyncStorage.setItem('@pomodoro_badges', JSON.stringify(updatedUnlockedBadges));
        }
    }, [unlockedBadges]);

    // Modal kapatıldığında
    const clearNewBadge = () => {
        setNewlyUnlockedBadge(null);
    };

    // Demo için rozetleri sıfırla
    const resetBadges = async () => {
        setUnlockedBadges([]);
        await AsyncStorage.removeItem('@pomodoro_badges');
    };

    return (
        <BadgeContext.Provider value={{
            unlockedBadges,
            checkBadges,
            newlyUnlockedBadge,
            clearNewBadge,
            resetBadges,
            stats,
            allBadges: BADGE_DEFINITIONS
        }}>
            {children}
        </BadgeContext.Provider>
    );
};
