import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const ThemePicker = () => {
    const { theme: activeTheme, changeTheme, themes } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: activeTheme.colors.text }]}>Temalar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {Object.values(themes).map((themeItem) => {
                    const isActive = activeTheme.id === themeItem.id;
                    return (
                        <TouchableOpacity
                            key={themeItem.id}
                            style={[
                                styles.themeCard,
                                isActive && { borderColor: themeItem.colors.primary, borderWidth: 2 },
                                { backgroundColor: themeItem.colors.card }
                            ]}
                            onPress={() => changeTheme(themeItem.id)}
                            activeOpacity={0.8}
                        >
                            {/* Renk Önizleme */}
                            <LinearGradient
                                colors={themeItem.gradient}
                                style={styles.previewGradient}
                            >
                                {isActive && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    </View>
                                )}
                            </LinearGradient>

                            {/* Tema Adı */}
                            <Text style={[
                                styles.themeName,
                                { color: themeItem.colors.text },
                                isActive && { fontWeight: 'bold', color: themeItem.colors.primary }
                            ]}>
                                {themeItem.name}
                            </Text>

                            {/* Renk Paleti */}
                            <View style={styles.paletteContainer}>
                                <View style={[styles.paletteCircle, { backgroundColor: themeItem.colors.primary }]} />
                                <View style={[styles.paletteCircle, { backgroundColor: themeItem.colors.secondary }]} />
                                <View style={[styles.paletteCircle, { backgroundColor: themeItem.colors.background, borderWidth: 1, borderColor: '#eee' }]} />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    themeCard: {
        width: 100,
        height: 140,
        borderRadius: 12,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingBottom: 10,
    },
    previewGradient: {
        width: '100%',
        height: 60,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkIcon: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 4,
    },
    themeName: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    paletteContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    paletteCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
});

export default ThemePicker;
