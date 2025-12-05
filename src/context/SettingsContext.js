import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

// Varsayılan kategoriler
const DEFAULT_CATEGORIES = [
    { id: '1', name: 'Ders Çalışma', icon: '📚', isDefault: true },
    { id: '2', name: 'Kodlama', icon: '💻', isDefault: true },
    { id: '3', name: 'Proje', icon: '📁', isDefault: true },
    { id: '4', name: 'Kitap Okuma', icon: '📖', isDefault: true },
];

// Varsayılan Pomodoro ayarları
const DEFAULT_SETTINGS = {
    pomodoroMinutes: 25,      // Çalışma süresi
    shortBreakMinutes: 5,     // Kısa mola
    longBreakMinutes: 15,     // Uzun mola
    sessionsUntilLongBreak: 4, // Kaç seans sonra uzun mola
    autoStartBreaks: false,    // Mola otomatik başlasın mı
    autoStartPomodoros: false, // Pomodoro otomatik başlasın mı
    soundEnabled: true,        // Ses bildirimleri
    vibrationEnabled: true,    // Titreşim
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [activeCategory, setActiveCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Ayarları ve kategorileri yükle
    useEffect(() => {
        loadSettings();
        loadCategories();
        loadActiveCategory();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem('pomodoro_settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error('Ayarlar yüklenirken hata:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const savedCategories = await AsyncStorage.getItem('pomodoro_categories');
            if (savedCategories) {
                setCategories(JSON.parse(savedCategories));
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    };

    const loadActiveCategory = async () => {
        try {
            const savedActiveCategory = await AsyncStorage.getItem('pomodoro_active_category');
            if (savedActiveCategory) {
                setActiveCategory(JSON.parse(savedActiveCategory));
            }
        } catch (error) {
            console.error('Aktif kategori yüklenirken hata:', error);
        }
    };

    // Aktif kategoriyi değiştir
    const changeActiveCategory = async (category) => {
        try {
            await AsyncStorage.setItem('pomodoro_active_category', JSON.stringify(category));
            setActiveCategory(category);
        } catch (error) {
            console.error('Aktif kategori kaydedilirken hata:', error);
        }
    };

    // Ayarları kaydet
    const saveSettings = async (newSettings) => {
        try {
            const updatedSettings = { ...settings, ...newSettings };
            await AsyncStorage.setItem('pomodoro_settings', JSON.stringify(updatedSettings));
            setSettings(updatedSettings);
        } catch (error) {
            console.error('Ayarlar kaydedilirken hata:', error);
        }
    };

    // Kategorileri kaydet
    const saveCategories = async (newCategories) => {
        try {
            await AsyncStorage.setItem('pomodoro_categories', JSON.stringify(newCategories));
            setCategories(newCategories);
        } catch (error) {
            console.error('Kategoriler kaydedilirken hata:', error);
        }
    };

    // Yeni kategori ekle
    const addCategory = async (name, icon) => {
        try {
            const newCategory = {
                id: Date.now().toString(),
                name,
                icon,
                isDefault: false,
            };
            const updatedCategories = [...categories, newCategory];
            await saveCategories(updatedCategories);
            return true;
        } catch (error) {
            console.error('Kategori eklenirken hata:', error);
            return false;
        }
    };

    // Kategori sil (sadece kullanıcı kategorileri)
    const deleteCategory = async (categoryId) => {
        try {
            const category = categories.find((c) => c.id === categoryId);
            if (category && category.isDefault) {
                return false; // Varsayılan kategoriler silinemez
            }
            const updatedCategories = categories.filter((c) => c.id !== categoryId);
            await saveCategories(updatedCategories);

            // Eğer silinen kategori aktif kategoriyse, aktif kategoriyi sıfırla
            if (activeCategory && activeCategory.id === categoryId) {
                changeActiveCategory(null);
            }
            return true;
        } catch (error) {
            console.error('Kategori silinirken hata:', error);
            return false;
        }
    };

    // Ayarları sıfırla
    const resetSettings = async () => {
        try {
            await AsyncStorage.setItem('pomodoro_settings', JSON.stringify(DEFAULT_SETTINGS));
            setSettings(DEFAULT_SETTINGS);
        } catch (error) {
            console.error('Ayarlar sıfırlanırken hata:', error);
        }
    };

    // Kategorileri sıfırla
    const resetCategories = async () => {
        try {
            await AsyncStorage.setItem('pomodoro_categories', JSON.stringify(DEFAULT_CATEGORIES));
            setCategories(DEFAULT_CATEGORIES);
        } catch (error) {
            console.error('Kategoriler sıfırlanırken hata:', error);
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                saveSettings,
                resetSettings,
                categories,
                addCategory,
                deleteCategory,
                resetCategories,
                activeCategory,
                changeActiveCategory,
                isLoading,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

// Hook olarak kullanım için
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
