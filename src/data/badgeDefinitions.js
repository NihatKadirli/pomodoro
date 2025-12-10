export const BADGE_DEFINITIONS = [
    // --- STREAK ROZETLERİ (Demo: Saniye/Dakika bazlı) ---
    {
        id: 'streak_30s',
        category: 'streak',
        title: 'Isınma Turu',
        description: '30 saniyelik odaklanma serisi yakala.',
        icon: '🔥',
        targetValue: 30, // saniye
        statKey: 'currentStreak',
        color: '#FF9800'
    },
    {
        id: 'streak_2m',
        category: 'streak',
        title: 'Alev Aldın!',
        description: '2 dakika boyunca hiç durmadan odaklan!',
        icon: '⚡',
        targetValue: 120, // 120 saniye
        statKey: 'currentStreak',
        color: '#F44336'
    },
    {
        id: 'streak_5m',
        category: 'streak',
        title: 'Durdurulamaz',
        description: '5 dakikalık kesintisiz odaklanma.',
        icon: '🚀',
        targetValue: 300,
        statKey: 'currentStreak',
        color: '#E91E63'
    },

    // --- MİKTAR ROZETLERİ ---
    {
        id: 'count_1',
        category: 'count',
        title: 'İlk Adım',
        description: 'İlk Pomodoro seansını tamamla.',
        icon: '🌱',
        targetValue: 1,
        statKey: 'totalPomodoros',
        color: '#4CAF50'
    },
    {
        id: 'count_5',
        category: 'count',
        title: 'Seri Üretim',
        description: 'Toplam 5 Pomodoro seansı tamamla.',
        icon: '🏭',
        targetValue: 5,
        statKey: 'totalPomodoros',
        color: '#00BCD4'
    },
    {
        id: 'count_10',
        category: 'count',
        title: 'Pomodoro Ustası',
        description: 'Toplam 10 seans. Artık profesyonelsin!',
        icon: '👑',
        targetValue: 10,
        statKey: 'totalPomodoros',
        color: '#FFD700'
    },

    // --- ZAMAN ROZETLERİ ---
    {
        id: 'time_early_bird',
        category: 'time',
        title: 'Erkenci Kuş',
        description: 'Sabah 06:00 - 10:00 arasında bir seans tamamla.',
        icon: '🌅',
        checkFunction: (stats) => {
            if (!stats.lastPomodoroDate) return false;
            const hour = new Date(stats.lastPomodoroDate).getHours();
            return hour >= 6 && hour < 10;
        },
        color: '#FFC107'
    },
    {
        id: 'time_night_owl',
        category: 'time',
        title: 'Gece Kuşu',
        description: 'Gece 22:00 - 04:00 arasında çalış.',
        icon: '🦉',
        checkFunction: (stats) => {
            if (!stats.lastPomodoroDate) return false;
            const hour = new Date(stats.lastPomodoroDate).getHours();
            return hour >= 22 || hour < 4;
        },
        color: '#3F51B5'
    },

    // --- ÖZEL ROZETLER ---
    {
        id: 'focus_ninja',
        category: 'special',
        title: 'Odak Ninjası',
        description: 'Hiç dikkat dağılmadan 3 seans tamamla.',
        icon: '🥷',
        targetValue: 3,
        statKey: 'completedWithoutDistraction',
        color: '#212121'
    }
];
