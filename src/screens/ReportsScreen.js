import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';

// import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
// import { BarChart, PieChart } from 'react-native-chart-kit';
import { getAllSessions, getTodaySessions, deleteAllSessions } from '../utils/storage';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import { useTheme } from '../context/ThemeContext'; // Theme Context Eklendi

const { width } = Dimensions.get('window');

// Kategori Renkleri - Sabit kalabilir veya temaya göre ayarlanabilir
const CATEGORY_COLORS = {
    'Ders Çalışma': '#42A5F5', // Daha parlak mavi
    'Kodlama': '#66BB6A',      // Daha parlak yeşil
    'Proje': '#FFA726',        // Daha parlak turuncu
    'Kitap Okuma': '#AB47BC',  // Daha parlak mor
    'Genel': '#78909C',        // Daha parlak gri
};

const ReportsScreen = () => {
    const { theme } = useTheme(); // Theme Hook
    const [sessions, setSessions] = useState([]);
    const [todaySessions, setTodaySessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Custom Alert Hook
    const { showAlert, hideAlert, alertConfig } = useCustomAlert();

    // Verileri Yükle
    const loadData = async () => {
        try {
            const allData = await getAllSessions();
            const todayData = await getTodaySessions();

            setSessions(allData);
            setTodaySessions(todayData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Sayfa her odaklandığında verileri yenile
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // Pull to Refresh
    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // İstatistik Hesaplamaları
    const todayTotal = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    const allTimeTotal = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalDistractions = sessions.reduce((sum, session) => sum + session.distractionCount, 0);

    // Son 7 Günün Verilerini Hazırla
    const getLast7DaysData = (allSessions) => {
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        const last7Days = [];
        const data = [];
        const labels = [];

        // Bugünden geriye 7 gün git
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const daySessions = allSessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= d && sessionDate < nextDay;
            });

            const totalDuration = daySessions.reduce((sum, s) => sum + s.duration, 0);

            data.push(totalDuration);
            labels.push(dayNames[d.getDay()]);
        }

        return {
            labels,
            datasets: [{ data }]
        };
    };

    // Kategori Dağılımını Hazırla
    const getCategoryDistribution = (allSessions) => {
        const distribution = {};

        allSessions.forEach(session => {
            const category = session.category || 'Genel';
            if (!distribution[category]) {
                distribution[category] = 0;
            }
            distribution[category] += session.duration;
        });

        return Object.keys(distribution)
            .map(category => ({
                name: category,
                population: distribution[category],
                color: CATEGORY_COLORS[category] || theme.colors.subText,
                legendFontColor: theme.colors.text, // Dinamik text rengi
                legendFontSize: 12
            }))
            .filter(item => item.population > 0)
            .sort((a, b) => b.population - a.population);
    };

    const chartData = useMemo(() => getLast7DaysData(sessions), [sessions]);
    const pieData = useMemo(() => getCategoryDistribution(sessions), [sessions, theme]);

    const hasChartData = chartData.datasets[0].data.some(val => val > 0);
    const hasPieData = pieData.length > 0;

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        if (isToday) return `Bugün ${timeStr}`;
        if (isYesterday) return `Dün ${timeStr}`;
        return `${date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} ${timeStr}`;
    };

    const handleDeleteAll = () => {
        showAlert({
            title: 'Tüm Verileri Sil',
            message: 'Tüm seans geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            type: 'error',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Evet, Sil',
                    onPress: async () => {
                        const success = await deleteAllSessions();
                        if (success) {
                            loadData();
                        }
                    }
                }
            ]
        });
    };

    // Mod Renklerini Belirle (Fallback ile)
    const modeColors = theme.modes || {
        pomodoro: theme.gradient,
        shortBreak: [theme.colors.accent, theme.colors.secondary],
        longBreak: [theme.colors.secondary, theme.colors.primary]
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.subText }]}>Veriler yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header Arka Planı */}
            <View
                style={[styles.headerBackground, { backgroundColor: theme.colors.primary }]}
            >
                <Text style={styles.headerTitle}>Raporlar</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                        progressBackgroundColor={theme.colors.card}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* İstatistik Kartları */}
                <View style={styles.statsGrid}>
                    {/* Bugün Kartı - Pomodoro Renkleri */}
                    <View
                        style={[styles.statCard, { backgroundColor: modeColors.pomodoro[0] }]}
                    >
                        <View style={styles.statIconContainer}>
                            <Ionicons name="calendar" size={24} color="rgba(255,255,255,0.9)" />
                        </View>
                        <Text style={styles.statNumber}>{todayTotal}</Text>
                        <Text style={styles.statLabel}>Bugün (dk)</Text>
                    </View>

                    {/* Tüm Zamanlar Kartı - Long Break Renkleri (Daha oturaklı) */}
                    <View
                        style={[styles.statCard, { backgroundColor: modeColors.longBreak[0] }]}
                    >
                        <View style={styles.statIconContainer}>
                            <Ionicons name="trophy" size={24} color="rgba(255,255,255,0.9)" />
                        </View>
                        <Text style={styles.statNumber}>{allTimeTotal}</Text>
                        <Text style={styles.statLabel}>Toplam (dk)</Text>
                    </View>

                    {/* Dikkat Dağınıklığı Kartı - Kırmızı Tonları (Sabit veya Modifiye) */}
                    <View
                        style={[styles.statCard, styles.fullWidthCard, { backgroundColor: '#FF5252' }]}
                    >
                        <View style={styles.rowCenter}>
                            <View>
                                <Text style={styles.statNumber}>{totalDistractions}</Text>
                                <Text style={styles.statLabel}>Toplam Dikkat Dağınıklığı</Text>
                            </View>
                            <View style={styles.largeIconContainer}>
                                <Ionicons name="notifications-off" size={40} color="rgba(255,255,255,0.3)" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Son 7 Gün Grafiği */}
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.chartHeader}>
                        <Ionicons name="bar-chart" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Haftalık Performans</Text>
                    </View>

                    <Text>Grafikler geçici olarak devre dışı.</Text>
                </View>

                {/* Kategori Dağılımı Pie Chart */}
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.chartHeader}>
                        <Ionicons name="pie-chart" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Kategori Dağılımı</Text>
                    </View>
                    <Text>Grafikler geçici olarak devre dışı.</Text>
                </View>

                {/* Son Seanslar Başlığı */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📋 Son Seanslar</Text>
                    {sessions.length > 0 && (
                        <Text style={[styles.sectionSubtitle, { color: theme.colors.subText }]}>Son 5 Kayıt</Text>
                    )}
                </View>

                {/* Seans Listesi */}
                {sessions.length === 0 ? (
                    <View style={[styles.emptyContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Ionicons name="bar-chart-outline" size={80} color={theme.colors.border} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Henüz Veri Yok</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.subText }]}>
                            Zamanlayıcıyı kullanarak ilk odaklanma seansını başlat! 💪
                        </Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {sessions.slice(0, 5).map((session) => (
                            <View key={session.id} style={[styles.sessionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <View style={styles.sessionHeader}>
                                    <View style={[styles.categoryBadge, { backgroundColor: theme.colors.border + '40' }]}>
                                        {/* Kategori ikonu eklenebilir ama şu an text */}
                                        <Ionicons name="pricetag" size={14} color={theme.colors.subText} style={{ marginRight: 4 }} />
                                        <Text style={[styles.categoryText, { color: theme.colors.text }]}>{session.category}</Text>
                                    </View>
                                    <Text style={[styles.dateText, { color: theme.colors.subText }]}>{formatDate(session.date)}</Text>
                                </View>

                                <View style={styles.sessionDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                                        <Text style={[styles.detailText, { color: theme.colors.subText }]}>
                                            <Text style={[styles.boldText, { color: theme.colors.text }]}>{session.duration}</Text> dk
                                        </Text>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                                    <View style={styles.detailItem}>
                                        <Ionicons name="alert-circle-outline" size={18} color={session.distractionCount > 0 ? "#F44336" : theme.colors.accent} />
                                        <Text style={[styles.detailText, session.distractionCount > 0 && { color: '#F44336' }, { color: theme.colors.subText }]}>
                                            <Text style={[styles.boldText, { color: session.distractionCount > 0 ? '#F44336' : theme.colors.text }]}>{session.distractionCount}</Text> dikkat
                                        </Text>
                                    </View>
                                </View>

                                {!session.completed && (
                                    <View style={[styles.incompleteBadge, { backgroundColor: '#FFF3E0' }]}>
                                        <Text style={styles.incompleteText}>Erken Sonlandırıldı</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Verileri Sil Butonu */}
                {sessions.length > 0 && (
                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={handleDeleteAll}
                    >
                        <Ionicons name="trash-outline" size={20} color="#F44336" style={{ marginRight: 8 }} />
                        <Text style={styles.deleteButtonText}>Tüm Verileri Sil</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    headerBackground: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: -30, // ScrollView'ın içine girmesi için
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 40, // Header üstte olduğu için padding azalttık
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: (width - 50) / 2, // 2 sütun
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        height: 140,
        justifyContent: 'space-between',
    },
    fullWidthCard: {
        width: '100%',
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    largeIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    chartContainer: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    noDataContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    noDataText: {
        marginTop: 10,
        fontSize: 14,
    },
    totalTimeContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        width: '100%',
        alignItems: 'center',
    },
    totalTimeText: {
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionSubtitle: {
        fontSize: 14,
    },
    listContainer: {
        marginBottom: 20,
    },
    sessionCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
    },
    sessionDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 15,
        marginLeft: 6,
    },
    boldText: {
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 16,
        marginHorizontal: 15,
    },
    incompleteBadge: {
        marginTop: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    incompleteText: {
        fontSize: 11,
        color: '#FF9800',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 24,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 12,
    },
    deleteButtonText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ReportsScreen;
