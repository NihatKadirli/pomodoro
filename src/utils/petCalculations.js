import { PET_LEVELS } from '../constants/petTypes';

// XP'ye göre seviye hesapla
export const calculateLevel = (currentXp) => {
    // Tersten döngü ile en yüksek uygun seviyeyi bul
    for (let i = PET_LEVELS.length - 1; i >= 0; i--) {
        if (currentXp >= PET_LEVELS[i].minXp) {
            return PET_LEVELS[i];
        }
    }
    return PET_LEVELS[0];
};

// Seans ödüllerini hesapla
export const calculateSessionRewards = (minutes, distractions, isStreak, petMultiplier = 1) => {
    // İSTEK: Her 1 dk = 1 XP
    let baseXp = Math.floor(minutes);

    // Bonuslar (Opsiyonel ama motivasyon için iyi)
    let bonusXp = 0;

    // Tam seans bonusu (25 dk ve üzeri için ekstra 5 XP)
    if (minutes >= 25) {
        bonusXp += 5;
    }

    // Hiç dikkat dağılmazsa ekstra bonus
    if (distractions === 0 && minutes > 5) {
        bonusXp += 2;
    }

    // Toplam Hesap
    // (Base + Bonus) * Pet Çarpanı
    const totalXp = Math.floor((baseXp + bonusXp) * petMultiplier);

    // Mutluluk Hesapla
    // Dakika başına 0.5 mutluluk, max 15
    const happinessGained = Math.min(15, Math.floor(minutes * 0.5));

    return {
        baseXp,
        bonusXp,
        totalXp,
        happinessGained
    };
};

// Bir sonraki seviye için ilerleme durumu
export const calculateProgress = (currentXp) => {
    const currentLevelInfo = calculateLevel(currentXp);
    const currentLevelIndex = currentLevelInfo.level;

    // Son seviyede miyiz?
    if (currentLevelIndex >= PET_LEVELS.length - 1) {
        return {
            nextLevelXp: currentXp, // Zaten max
            progress: 100
        };
    }

    const nextLevelInfo = PET_LEVELS[currentLevelIndex + 1];
    const prevLevelXp = currentLevelInfo.minXp;
    const nextLevelTarget = nextLevelInfo.minXp;

    // Bu seviyedeki ilerleme (0-100 arası)
    // Formül: (MevcutXP - BuSeviyeBaşlangıç) / (SonrakiSeviye - BuSeviyeBaşlangıç) * 100
    const progress = ((currentXp - prevLevelXp) / (nextLevelTarget - prevLevelXp)) * 100;

    return {
        nextLevelXp: nextLevelTarget,
        progress: Math.min(100, Math.max(0, progress))
    };
};
