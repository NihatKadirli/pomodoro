import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import { themes } from '../constants/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(themes.light);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedThemeId = await AsyncStorage.getItem('pomodoro_theme');
            if (savedThemeId && themes[savedThemeId]) {
                setTheme(themes[savedThemeId]);
            }
        } catch (error) {
            console.error('Tema yüklenirken hata:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const changeTheme = async (themeId) => {
        if (!themes[themeId]) return;

        const newTheme = themes[themeId];
        setTheme(newTheme);

        try {
            await AsyncStorage.setItem('pomodoro_theme', themeId);
        } catch (error) {
            console.error('Tema kaydedilirken hata:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme, themes, isLoading }}>
            <StatusBar
                barStyle={theme.id === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background === '#121212' ? '#121212' : 'transparent'}
                translucent={theme.id !== 'dark'}
            />
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
