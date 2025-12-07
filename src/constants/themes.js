export const themes = {
    light: {
        id: 'light',
        name: 'Aydınlık',
        colors: {
            primary: '#FF6347',
            secondary: '#FF8C69',
            background: '#FFFFFF',
            card: '#F5F5F5',
            text: '#333333',
            subText: '#666666',
            accent: '#4CAF50',
            border: '#E0E0E0',
            functionBtn: '#f0f0f0',
            shadow: '#000000',
        },
        gradient: ['#FF6347', '#FF8C69'],
        // Modlara özel renkler
        modes: {
            pomodoro: ['#FF6347', '#FF8C69'],   // Kırmızı/Turuncu
            shortBreak: ['#4ECDC4', '#44A08D'], // Turkuaz
            longBreak: ['#667eea', '#764ba2'],  // Mor
        }
    },
    dark: {
        id: 'dark',
        name: 'Karanlık',
        colors: {
            primary: '#FF765E',
            secondary: '#D84315',
            background: '#121212',
            card: '#1E1E1E',
            text: '#FFFFFF',
            subText: '#AAAAAA',
            accent: '#66BB6A',
            border: '#333333',
            functionBtn: '#2C2C2C',
            shadow: '#000000',
        },
        gradient: ['#1E1E1E', '#121212'],
        modes: {
            pomodoro: ['#FF5252', '#D32F2F'],   // Canlı Kırmızı (Karanlıkta parlar)
            shortBreak: ['#26A69A', '#00897B'], // Koyu Turkuaz/Yeşil
            longBreak: ['#5C6BC0', '#3949AB'],  // İndigo/Mor
        }
    },
    ocean: {
        id: 'ocean',
        name: 'Okyanus',
        colors: {
            primary: '#0288D1',
            secondary: '#29B6F6',
            background: '#E1F5FE',
            card: '#FFFFFF',
            text: '#01579B',
            subText: '#4FC3F7',
            accent: '#00BCD4',
            border: '#B3E5FC',
            functionBtn: '#B3E5FC',
            shadow: '#01579B',
        },
        gradient: ['#0288D1', '#29B6F6'],
        modes: {
            pomodoro: ['#0288D1', '#29B6F6'],   // Okyanus Mavisi
            shortBreak: ['#4DD0E1', '#00BCD4'], // Açık Cyan
            longBreak: ['#01579B', '#0277BD'],  // Derin Mavi
        }
    },
    forest: {
        id: 'forest',
        name: 'Orman',
        colors: {
            primary: '#2E7D32',
            secondary: '#66BB6A',
            background: '#E8F5E9',
            card: '#FFFFFF',
            text: '#1B5E20',
            subText: '#4CAF50',
            accent: '#8BC34A',
            border: '#C8E6C9',
            functionBtn: '#C8E6C9',
            shadow: '#1B5E20',
        },
        gradient: ['#2E7D32', '#66BB6A'],
        modes: {
            pomodoro: ['#2E7D32', '#43A047'],   // Koyu Yeşil
            shortBreak: ['#8BC34A', '#AED581'], // Açık Yeşil (Limon)
            longBreak: ['#1B5E20', '#2E7D32'],  // Orman Yeşili
        }
    },
    sunset: {
        id: 'sunset',
        name: 'Gün Batımı',
        colors: {
            primary: '#F57C00',
            secondary: '#FFB74D',
            background: '#FFF3E0',
            card: '#FFFFFF',
            text: '#E65100',
            subText: '#FF9800',
            accent: '#FF5722',
            border: '#FFE0B2',
            functionBtn: '#FFE0B2',
            shadow: '#E65100',
        },
        gradient: ['#F57C00', '#FFB74D'],
        modes: {
            pomodoro: ['#EF6C00', '#FF9800'],   // Turuncu
            shortBreak: ['#FF7043', '#FFAB91'], // Somon
            longBreak: ['#BF360C', '#D84315'],  // Kızıl
        }
    }
};
