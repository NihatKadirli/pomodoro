import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'En İyi Pomodoro Üretkenlik Asistanınız',
        description: 'SaüPomodoro, yolda kalmanıza, görevleri yönetmenize ve verimli çalışmanıza yardımcı olur. Şimdi SaüPomodoro ile başlayalım!',
        icon: 'timer-outline',
        isSplash: true,
    },
    {
        id: '2',
        title: 'Zahmetsiz Organizasyon - Hepsi Bir Arada',
        description: 'SaüPomodoro\'nun sezgisel proje ve etiket sistemi ile çalışmalarınızı kolayca kategorize edin, düzenli kalın ve görevlerin üstesinden gelin.',
        image: require('../../assets/icon.png'), // Placeholder for mockup
        icon: 'folder-open-outline',
    },
    {
        id: '3',
        title: 'İlerlemenizi Takip Edin & Başarınızı Görselleştirin',
        description: 'Üretkenliğinizi zaman içinde takip edin, içgörüler kazanın ve verimliliğinizi artırın. Hedeflerinize ulaşma zamanı.',
        icon: 'stats-chart-outline',
    },
];

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Splash ekranı için otomatik geçiş
    useEffect(() => {
        if (currentIndex === 0) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();

            const timer = setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index: 1, animated: true });
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setCurrentIndex(index);
    };

    const handleCompleteOnboarding = async () => {
        // AsyncStorage kaydı kaldırıldı, her seferinde gösterilecek
        navigation.replace('Login');
    };

    const handleSkip = () => {
        handleCompleteOnboarding();
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            handleCompleteOnboarding();
        }
    };

    const renderItem = ({ item, index }) => {
        // İlk slayt (Splash benzeri)
        if (item.isSplash) {
            return (
                <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    style={[styles.slide, { justifyContent: 'center' }]}
                >
                    <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                        <Ionicons name={item.icon} size={120} color="white" />
                        <Text style={styles.splashTitle}>SaüPomodoro</Text>
                        <View style={styles.loadingContainer}>
                            {/* Basit bir loading indikatörü simülasyonu */}
                            <View style={styles.loadingDot} />
                        </View>
                    </Animated.View>
                </LinearGradient>
            );
        }

        // Diğer slaytlar (Walkthrough)
        return (
            <View style={styles.slide}>
                <View style={styles.mockupContainer}>
                    <View style={styles.mockup}>
                        {/* Mockup temsili görsel */}
                        <LinearGradient colors={['#f0f0f0', '#e0e0e0']} style={styles.mockupScreen}>
                            <Ionicons name={item.icon} size={80} color="#FF6B6B" />
                        </LinearGradient>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                keyExtractor={(item) => item.id}
                bounces={false}
            />

            {/* Kontroller (Sadece Splash olmayan ekranlarda göster) */}
            {currentIndex > 0 && (
                <View style={styles.footer}>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => (
                            // İlk slayt splash olduğu için pagination'da göstermeyebiliriz veya hepsini gösterebiliriz.
                            // Tasarımda 3 nokta var, biz 1. slaytı splash gibi kullandık ama yine de dahil edelim.
                            index > 0 && (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        currentIndex === index ? styles.activeDot : styles.inactiveDot,
                                    ]}
                                />
                            )
                        ))}
                    </View>

                    <View style={styles.buttonContainer}>
                        {currentIndex < slides.length - 1 ? (
                            <>
                                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                                    <Text style={styles.skipText}>Atla</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                                    <Text style={styles.nextText}>Devam Et</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={handleNext} style={[styles.nextButton, { width: '100%' }]}>
                                <Text style={styles.nextText}>Başla</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slide: {
        width: width,
        height: height,
        alignItems: 'center',
        paddingTop: 60,
    },
    splashTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
    },
    loadingContainer: {
        marginTop: 50,
    },
    loadingDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        borderTopColor: 'white',
    },
    mockupContainer: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    mockup: {
        width: width * 0.7,
        height: height * 0.4,
        backgroundColor: '#fff',
        borderRadius: 40,
        borderWidth: 8,
        borderColor: '#333',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    mockupScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 0.3,
        paddingHorizontal: 30,
        alignItems: 'center',
        marginTop: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    activeDot: {
        width: 25,
        backgroundColor: '#FF6B6B',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: '#ddd',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        padding: 15,
    },
    skipText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    nextText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;
