import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getAllSessions, getTodaySessions, deleteAllSessions } from '../utils/storage';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

// Kategori Renkleri
const CATEGORY_COLORS = {
    'Ders Çalışma': '#2196F3', // Mavi
    'Kodlama': '#4CAF50',      // Yeşil
    'Proje': '#FF9800',        // Turuncu
    'Kitap Okuma': '#9C27B0',  // Mor
    'Genel': '#607D8B',        // Gri
};

const ReportsScreen = () => {
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
            d.setHours(0, 0, 0, 0); // Günün başlangıcı

            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1); // Günün bitişi (ertesi gün başı)

            // O güne ait seansları filtrele
            const daySessions = allSessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= d && sessionDate < nextDay;
            });

            // Toplam süreyi hesapla
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

        // Kategorilere göre grupla ve süreleri topla
        allSessions.forEach(session => {
            const category = session.category || 'Genel';
            if (!distribution[category]) {
                distribution[category] = 0;
            }
            distribution[category] += session.duration;
        });

        // Pie Chart formatına dönüştür
        return Object.keys(distribution)
            .map(category => ({
                name: category,
                population: distribution[category],
                color: CATEGORY_COLORS[category] || '#607D8B', // Tanımsızsa gri
                legendFontColor: '#7F7F7F',
                legendFontSize: 12
            }))
            .filter(item => item.population > 0) // 0 süreli olanları filtrele
            .sort((a, b) => b.population - a.population); // Büyükten küçüğe sırala
    };

    // Chart verilerini optimize et
    const chartData = useMemo(() => getLast7DaysData(sessions), [sessions]);
    const pieData = useMemo(() => getCategoryDistribution(sessions), [sessions]);

    // Grafikte veri var mı kontrolü
    const hasChartData = chartData.datasets[0].data.some(val => val > 0);
    const hasPieData = pieData.length > 0;

    // Tarih Formatlama
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

    // Verileri Silme İşlemi
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
                            loadData(); // Listeyi yenile
                        }
                    }
                }
            ]
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />
                }
            >
                {/* Başlık */}
                <Text style={styles.headerTitle}>İstatistikler</Text>

                {/* İstatistik Kartları */}
                <View style={styles.statsGrid}>
                    {/* Bugün Kartı */}
                    <LinearGradient
                        colors={['#5a5f77ff', '#a24f4bff']}
                        style={styles.statCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.statIconContainer}>
                            <Ionicons name="calendar" size={24} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Text style={styles.statNumber}>{todayTotal}</Text>
                        <Text style={styles.statLabel}>Bugün (dk)</Text>
                    </LinearGradient>

                    {/* Tüm Zamanlar Kartı */}
                    <LinearGradient
                        colors={['#c39494ff', '#f5576c']}
                        style={styles.statCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.statIconContainer}>
                            <Ionicons name="trophy" size={24} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Text style={styles.statNumber}>{allTimeTotal}</Text>
                        <Text style={styles.statLabel}>Toplam (dk)</Text>
                    </LinearGradient>

                    {/* Dikkat Dağınıklığı Kartı */}
                    <LinearGradient
                        colors={['#c21264ff', '#fe1500ff']}
                        style={[styles.statCard, styles.fullWidthCard]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.rowCenter}>
                            <View>
                                <Text style={styles.statNumber}>{totalDistractions}</Text>
                                <Text style={styles.statLabel}>Toplam Dikkat Dağınıklığı</Text>
                            </View>
                            <View style={styles.largeIconContainer}>
                                <Ionicons name="notifications-off" size={40} color="rgba(255,255,255,0.4)" />
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Son 7 Gün Grafiği */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>📊 Son 7 Gün Performansı</Text>

                    {hasChartData ? (
                        <BarChart
                            data={chartData}
                            width={width - 60}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=" dk"
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForBackgroundLines: {
                                    strokeDasharray: '',
                                    stroke: '#f0f0f0',
                                    strokeWidth: 1
                                },
                                propsForLabels: {
                                    fontSize: 10
                                },
                                barPercentage: 0.7,
                            }}
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                paddingRight: 0,
                            }}
                            showValuesOnTopOfBars={true}
                            fromZero={true}
                            withInnerLines={true}
                            showBarTops={false}
                        />
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Ionicons name="stats-chart" size={48} color="#eee" />
                            <Text style={styles.noDataText}>Son 7 günde seans kaydı bulunmuyor</Text>
                        </View>
                    )}
                </View>

                {/* Kategori Dağılımı Pie Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>🎯 Kategori Dağılımı</Text>

                    {hasPieData ? (
                        <>
                            <PieChart
                                data={pieData}
                                width={width - 40}
                                height={220}
                                chartConfig={{
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                center={[10, 0]}
                                absolute
                                hasLegend={true}
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                            <View style={styles.totalTimeContainer}>
                                <Text style={styles.totalTimeText}>
                                    Toplam Odaklanma: <Text style={styles.boldText}>{allTimeTotal} dk</Text>
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Ionicons name="pie-chart" size={48} color="#eee" />
                            <Text style={styles.noDataText}>Henüz kategori verisi bulunmuyor</Text>
                        </View>
                    )}
                </View>

                {/* Son Seanslar Başlığı */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📋 Son Seanslar</Text>
                    {sessions.length > 0 && (
                        <Text style={styles.sectionSubtitle}>Son 5 Kayıt</Text>
                    )}
                </View>

                {/* Seans Listesi */}
                {sessions.length === 0 ? (
                    // Boş Durum
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bar-chart-outline" size={80} color="#ddd" />
                        <Text style={styles.emptyTitle}>Henüz Veri Yok</Text>
                        <Text style={styles.emptySubtitle}>
                            Zamanlayıcıyı kullanarak ilk odaklanma seansını başlat! 💪
                        </Text>
                    </View>
                ) : (
                    // Liste
                    <View style={styles.listContainer}>
                        {sessions.slice(0, 5).map((session) => (
                            <View key={session.id} style={styles.sessionCard}>
                                <View style={styles.sessionHeader}>
                                    <View style={styles.categoryBadge}>
                                        <Ionicons name="pricetag" size={14} color="#666" style={{ marginRight: 4 }} />
                                        <Text style={styles.categoryText}>{session.category}</Text>
                                    </View>
                                    <Text style={styles.dateText}>{formatDate(session.date)}</Text>
                                </View>

                                <View style={styles.sessionDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="time-outline" size={18} color="#FF6B6B" />
                                        <Text style={styles.detailText}>
                                            <Text style={styles.boldText}>{session.duration}</Text> dk
                                        </Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.detailItem}>
                                        <Ionicons name="alert-circle-outline" size={18} color={session.distractionCount > 0 ? "#F44336" : "#4CAF50"} />
                                        <Text style={[styles.detailText, session.distractionCount > 0 && { color: '#F44336' }]}>
                                            <Text style={styles.boldText}>{session.distractionCount}</Text> dikkat
                                        </Text>
                                    </View>
                                </View>

                                {!session.completed && (
                                    <View style={styles.incompleteBadge}>
                                        <Text style={styles.incompleteText}>Erken Sonlandırıldı</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Verileri Sil Butonu */}
                {sessions.length > 0 && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAll}>
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
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
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
        backgroundColor: 'white',
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
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    noDataContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    noDataText: {
        marginTop: 10,
        color: '#999',
        fontSize: 14,
    },
    totalTimeContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        width: '100%',
        alignItems: 'center',
    },
    totalTimeText: {
        fontSize: 14,
        color: '#666',
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
        color: '#333',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#999',
    },
    listContainer: {
        marginBottom: 20,
    },
    sessionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
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
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
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
        color: '#555',
        marginLeft: 6,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: '#eee',
        marginHorizontal: 15,
    },
    incompleteBadge: {
        marginTop: 10,
        backgroundColor: '#FFF3E0',
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
        backgroundColor: 'white',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#eee',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#999',
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
        borderColor: '#ffebee',
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    deleteButtonText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ReportsScreen;
