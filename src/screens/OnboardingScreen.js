
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Greeting',
        isSplash: true,
        icon: 'hourglass',
    },
    {
        id: '2',
        title: 'Odaklan ve Başar',
        description: 'Pomodoro tekniği ile çalışmalarını 25 dakikalık odak seanslarına böl. Dikkatin dağılmadan, maksimum verimle hedeflerine ulaş.',
        icon: 'timer-outline',
        color: '#FF6B6B',
    },
    {
        id: '3',
        title: 'Eğlenceli Üretkenlik',
        description: 'Sadece çalışmakla kalma, her tamamladığın görevle sanal arkadaşını besle ve büyüt. Başarılarını sevimli bir yol arkadaşıyla kutla!',
        icon: 'game-controller-outline', // veya paw-outline
        color: '#4ECDC4',
    },
    {
        id: '4',
        title: 'Gelişimini Takip Et',
        description: 'Detaylı grafikler ve raporlarla çalışma alışkanlıklarını analiz et. Hangi saatlerde daha verimlisin, ne kadar yol kat ettin hepsini gör.',
        icon: 'analytics-outline',
        color: '#A8DADC', // veya daha koyu bir renk #457B9D
    },
];

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current; // Metin animasyonu için

    // Splash ekranı yönetimi
    useEffect(() => {
        if (currentIndex === 0) {
            // Logo görünürlüğü
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();

            // Otomatik geçiş
            const timer = setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index: 1, animated: true });
                }
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            // Her slayt değişiminde metin animasyonunu tetikle
            slideAnim.setValue(50);
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    }, [currentIndex]);

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    const handleCompleteOnboarding = async () => {
        navigation.replace('Login');
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            handleCompleteOnboarding();
        }
    };

    const renderItem = ({ item, index }) => {
        // --- SPLASH SLIDE ---
        if (item.isSplash) {
            return (
                <View style={{ width, height }}>
                    <LinearGradient
                        colors={['#FF6B6B', '#FF8E53']}
                        style={[styles.fullScreenCenter]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <StatusBar barStyle="light-content" />
                        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                            <View style={styles.splashIconContainer}>
                                <Ionicons name="timer" size={80} color="#FF6B6B" />
                            </View>
                            <Text style={styles.splashTitle}>SaüPomodoro</Text>
                            <Text style={styles.splashSubtitle}>Odaklan. Üret. Kazan.</Text>
                        </Animated.View>
                    </LinearGradient>
                </View>
            );
        }

        // --- INFO SLIDES ---
        return (
            <View style={styles.slideContainer}>
                {/* Üst Kısım: Görsel/İkon Alanı */}
                <View style={styles.visualContainer}>
                    <LinearGradient
                        colors={[item.color, '#fff']}
                        style={styles.circleBackground}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    />
                    <View style={[styles.iconCircle, { shadowColor: item.color }]}>
                        <Ionicons name={item.icon} size={100} color={item.color} />
                    </View>
                </View>

                {/* Alt Kısım: Metin Alanı */}
                <View style={styles.textContainer}>
                    <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </Animated.View>
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
                scrollEnabled={currentIndex !== 0} // Splash sırasında kaydırmayı engelle
            />

            {/* Pagination ve Butonlar (Splash haricinde göster) */}
            {currentIndex > 0 && (
                <View style={styles.footerContainer}>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => {
                            if (index === 0) return null; // Splash için dot yok
                            return (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: currentIndex === index ? slides[index].color : '#E0E0E0',
                                            width: currentIndex === index ? 24 : 8,
                                        }
                                    ]}
                                />
                            );
                        })}
                    </View>

                    {/* Alt Butonlar */}
                    <View style={styles.buttonWrapper}>
                        {currentIndex === slides.length - 1 ? (
                            <TouchableOpacity
                                style={[styles.mainButton, { backgroundColor: slides[currentIndex].color }]}
                                onPress={handleCompleteOnboarding}
                            >
                                <Text style={styles.mainButtonText}>Hadi Başlayalım</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.navigationButtons}>
                                <TouchableOpacity onPress={handleCompleteOnboarding} style={styles.skipButton}>
                                    <Text style={styles.skipText}>Atla</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.nextButtonCircle, { backgroundColor: slides[currentIndex].color }]}
                                    onPress={handleNext}
                                >
                                    <Ionicons name="chevron-forward" size={30} color="white" />
                                </TouchableOpacity>
                            </View>
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
    fullScreenCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Splash Styles
    splashIconContainer: {
        width: 140,
        height: 140,
        backgroundColor: 'white',
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    splashTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
    },
    splashSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        fontWeight: '500',
    },

    // Slide Styles
    slideContainer: {
        width: width,
        height: height,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    visualContainer: {
        flex: 0.55,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circleBackground: {
        position: 'absolute',
        top: -height * 0.1,
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        opacity: 0.15,
    },
    iconCircle: {
        width: 180,
        height: 180,
        backgroundColor: 'white',
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 15, // Android gölge
    },

    textContainer: {
        flex: 0.45,
        paddingHorizontal: 40,
        paddingTop: 40,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3436',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#636E72',
        textAlign: 'center',
        lineHeight: 24,
    },

    // Footer
    footerContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 32,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },

    buttonWrapper: {
        height: 60,
        justifyContent: 'center',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        fontSize: 16,
        color: '#B2BEC3',
        fontWeight: '600',
    },
    nextButtonCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    mainButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    mainButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;

