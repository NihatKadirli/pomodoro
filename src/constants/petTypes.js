export const PET_TYPES = {
    CAT: {
        id: 'cat',
        name: 'Kedi',
        icon: '🐱',
        description: 'Sadık ve sakin.',
        unlockMinutes: 0,
        colors: {
            body: '#FFA726',
            belly: '#FFE0B2',
            eyes: '#3E2723'
        },
        traits: {
            xpMultiplier: 1.0,
            happinessDecay: 1.0
        }
    },
    DOG: {
        id: 'dog',
        name: 'Köpek',
        icon: '🐶',
        description: 'Enerjik ve mutlu.',
        unlockMinutes: 1, // 1 dakika (Test Mode)
        colors: {
            body: '#8D6E63',
            belly: '#D7CCC8',
            eyes: '#3E2723'
        },
        traits: {
            xpMultiplier: 1.1,
            happinessDecay: 1.2
        }
    },
    DRAGON: {
        id: 'dragon',
        name: 'Ejderha',
        icon: '🐉',
        description: 'Efsanevi ve güçlü.',
        unlockMinutes: 3, // 3 dakika (Test Mode)
        colors: {
            body: '#EF5350',
            belly: '#FFCDD2',
            eyes: '#FFEB3B'
        },
        traits: {
            xpMultiplier: 1.5,
            happinessDecay: 0.8
        }
    },
    ROBOT: {
        id: 'robot',
        name: 'Robot',
        icon: '🤖',
        description: 'Verimli ve odaklı.',
        unlockMinutes: 5, // 5 dakika (Test Mode)
        colors: {
            body: '#78909C',
            belly: '#CFD8DC',
            eyes: '#00E676'
        },
        traits: {
            xpMultiplier: 1.2,
            happinessDecay: 0.5
        }
    },
    UNICORN: {
        id: 'unicorn',
        name: 'Unicorn',
        icon: '🦄',
        description: 'Büyülü ve nadir.',
        unlockMinutes: 8, // 8 dakika (Test Mode)
        colors: {
            body: '#F48FB1',
            belly: '#F8BBD0',
            eyes: '#2196F3'
        },
        traits: {
            xpMultiplier: 2.0,
            happinessDecay: 1.0
        }
    }
};

// TURBO TEST LEVEL SİSTEMİ
export const PET_LEVELS = [
    { level: 0, minXp: 0, title: 'Yumurta', scale: 0.6 },
    { level: 1, minXp: 1, title: 'Bebek', scale: 0.8 },       // 1 XP (Hemen)
    { level: 2, minXp: 10, title: 'Genç', scale: 0.9 },       // 10 XP (1. Seans sonu)
    { level: 3, minXp: 20, title: 'Yetişkin', scale: 1.0 },   // 20 XP
    { level: 4, minXp: 40, title: 'Evrimleşmiş', scale: 1.2 },// 40 XP
    { level: 5, minXp: 80, title: 'Efsanevi', scale: 1.3 },   // 80 XP
    { level: 6, minXp: 150, title: 'Kadim', scale: 1.4 },
    { level: 7, minXp: 300, title: 'İlahi', scale: 1.5 },
    { level: 8, minXp: 500, title: 'Kozmik', scale: 1.6 },
    { level: 9, minXp: 1000, title: 'Sonsuz', scale: 1.7 },
    { level: 10, minXp: 2000, title: 'Mutlak', scale: 1.8 },
];
