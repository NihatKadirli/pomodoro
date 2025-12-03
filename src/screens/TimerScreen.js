import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Vibration, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useSettings } from '../context/SettingsContext';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.65;
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Timer Modları
const TIMER_MODES = {
    POMODORO: 'pomodoro',
    SHORT_BREAK: 'shortBreak',
    LONG_BREAK: 'longBreak',
};

const TimerScreen = () => {
    const { settings, activeCategory } = useSettings();
    const { showAlert, hideAlert, alertConfig } = useCustomAlert();

    // State
    const [timeLeft, setTimeLeft] = useState(settings.pomodoroMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [distractionCount, setDistractionCount] = useState(0);
    const [currentMode, setCurrentMode] = useState(TIMER_MODES.POMODORO);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [totalDuration, setTotalDuration] = useState(settings.pomodoroMinutes * 60);

    // AppState referansı - Uygulama durumunu takip için
    const appState = useRef(AppState.currentState);
    const isActiveRef = useRef(isActive);
    const currentModeRef = useRef(currentMode);
    const wasInterruptedRef = useRef(false); // Dikkat dağınıklığı ile mi durdu?

    // Ref'leri güncel tut
    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
        currentModeRef.current = currentMode;
    }, [currentMode]);

    // Ayarlar değiştiğinde süreleri güncelle
    useEffect(() => {
        if (!isActive) {
            updateTimerForMode(currentMode);
        }
    }, [settings]);

    // AppState Listener - Dikkat dağınıklığı takibi
    useEffect(() => {
        console.log('🔵 AppState Listener oluşturuldu');

        const subscription = AppState.addEventListener('change', nextAppState => {
            console.log('🟢 AppState DEĞİŞTİ:', appState.current, '→', nextAppState);

            // Sadece Pomodoro modunda kontrol et
            const isPomodoroMode = currentModeRef.current === TIMER_MODES.POMODORO;

            if (isPomodoroMode) {
                // Background'a geçiş (active → background/inactive) VE timer çalışıyorsa
                if (
                    appState.current === 'active' &&
                    (nextAppState === 'background' || nextAppState === 'inactive') &&
                    isActiveRef.current
                ) {
                    console.log('⚠️ Dikkat dağıldı! Uygulama background\'a geçti');
                    setDistractionCount(prev => prev + 1);
                    setIsActive(false);
                    wasInterruptedRef.current = true;
                }

                // Active'e dönüş (background → active) VE kesinti varsa
                if (
                    (appState.current === 'background' || appState.current === 'inactive') &&
                    nextAppState === 'active' &&
                    wasInterruptedRef.current
                ) {
                    console.log('✅ Kullanıcı geri döndü - Custom Alert gösteriliyor');
                    wasInterruptedRef.current = false;

                    // Custom Alert göster
                    setTimeout(() => {
                        showAlert({
                            title: 'Geri Döndünüz!',
                            message: 'Odaklanma seansına devam etmek istiyor musunuz?',
                            type: 'info',
                            buttons: [
                                {
                                    text: 'Hayır',
                                    style: 'cancel',
                                    onPress: () => {
                                        console.log('❌ Kullanıcı devam etmek istemedi');
                                    }
                                },
                                {
                                    text: 'Evet',
                                    onPress: () => {
                                        console.log('✅ Kullanıcı devam etmek istedi');
                                        setIsActive(true);
                                    }
                                }
                            ]
                        });
                    }, 500);
                }
            }

            appState.current = nextAppState;
        });

        // Cleanup - Memory leak önleme
        return () => {
            console.log('🔴 AppState Listener temizlendi');
            subscription.remove();
        };
    }, []);

    // Timer mantığı
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            handleTimerComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const updateTimerForMode = (mode) => {
        let duration;
        switch (mode) {
            case TIMER_MODES.POMODORO:
                duration = settings.pomodoroMinutes * 60;
                break;
            case TIMER_MODES.SHORT_BREAK:
                duration = settings.shortBreakMinutes * 60;
                break;
            case TIMER_MODES.LONG_BREAK:
                duration = settings.longBreakMinutes * 60;
                break;
            default:
                duration = settings.pomodoroMinutes * 60;
        }
        setTimeLeft(duration);
        setTotalDuration(duration);
    };

    const handleTimerComplete = () => {
        // Bildirim
        if (settings.vibrationEnabled) {
            Vibration.vibrate([0, 500, 200, 500]);
        }

        if (currentMode === TIMER_MODES.POMODORO) {
            const newCount = completedPomodoros + 1;
            setCompletedPomodoros(newCount);

            // Uzun mola zamanı mı?
            if (newCount % settings.sessionsUntilLongBreak === 0) {
                showAlert({
                    title: '🎉 Harika İş!',
                    message: `${settings.sessionsUntilLongBreak} Pomodoro tamamladın! Uzun mola zamanı.`,
                    type: 'success',
                    icon: 'trophy',
                    buttons: [
                        {
                            text: 'Uzun Mola Başlat',
                            onPress: () => switchMode(TIMER_MODES.LONG_BREAK),
                        },
                    ]
                });
            } else {
                showAlert({
                    title: 'Pomodoro Tamamlandı!',
                    message: `Kısa bir mola zamanı. ${newCount} / ${settings.sessionsUntilLongBreak} Pomodoro`,
                    type: 'success',
                    buttons: [
                        {
                            text: 'Kısa Mola Başlat',
                            onPress: () => switchMode(TIMER_MODES.SHORT_BREAK),
                        },
                    ]
                });
            }
        } else {
            // Mola bitti
            showAlert({
                title: 'Mola Bitti!',
                message: 'Yeni bir Pomodoro başlatmaya hazır mısın?',
                type: 'info',
                icon: 'cafe',
                buttons: [
                    {
                        text: 'Pomodoro Başlat',
                        onPress: () => switchMode(TIMER_MODES.POMODORO),
                    },
                ]
            });
        }
    };

    const switchMode = (mode) => {
        setCurrentMode(mode);
        updateTimerForMode(mode);
        setDistractionCount(0);
        wasInterruptedRef.current = false;

        // Otomatik başlatma
        if (mode === TIMER_MODES.POMODORO && settings.autoStartPomodoros) {
            setIsActive(true);
        } else if (mode !== TIMER_MODES.POMODORO && settings.autoStartBreaks) {
            setIsActive(true);
        }
    };

    const handleStart = () => {
        console.log('▶️ Timer başlatıldı');
        setIsActive(true);
    };

    const handlePause = () => {
        console.log('⏸️ Timer duraklatıldı (manuel)');
        setIsActive(false);
        wasInterruptedRef.current = false;
    };

    const handleReset = () => {
        showAlert({
            title: 'Seansı Bitir',
            message: 'Seansı sonlandırmak istediğinize emin misiniz?',
            type: 'warning',
            buttons: [
                {
                    text: 'İptal',
                    style: 'cancel'
                },
                {
                    text: 'Bitir',
                    onPress: () => {
                        setIsActive(false);
                        updateTimerForMode(currentMode);
                        setDistractionCount(0);
                        wasInterruptedRef.current = false;
                    },
                },
            ]
        });
    };

    const adjustTime = (minutes) => {
        if (!isActive) {
            const newTime = timeLeft + minutes * 60;
            if (newTime > 0) {
                setTimeLeft(newTime);
                setTotalDuration(newTime);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const progress = timeLeft / totalDuration;
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    // Mod bilgileri
    const getModeInfo = () => {
        switch (currentMode) {
            case TIMER_MODES.POMODORO:
                return {
                    title: 'Pomodoro',
                    icon: '🍅',
                    color: ['#FF6B6B', '#FF8E53'],
                    label: isActive ? 'Odaklanılıyor' : 'Hazır mısın?',
                };
            case TIMER_MODES.SHORT_BREAK:
                return {
                    title: 'Kısa Mola',
                    icon: '☕',
                    color: ['#4ECDC4', '#44A08D'],
                    label: isActive ? 'Mola Veriliyor' : 'Dinlen',
                };
            case TIMER_MODES.LONG_BREAK:
                return {
                    title: 'Uzun Mola',
                    icon: '🌴',
                    color: ['#667eea', '#764ba2'],
                    label: isActive ? 'İyi Dinlenmeler' : 'Uzun Mola',
                };
            default:
                return {
                    title: 'Pomodoro',
                    icon: '🍅',
                    color: ['#FF6B6B', '#FF8E53'],
                    label: 'Hazır mısın?',
                };
        }
    };

    const modeInfo = getModeInfo();

    return (
        <View style={styles.container}>
            <LinearGradient colors={modeInfo.color} style={styles.headerBackground}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.modeIcon}>{modeInfo.icon}</Text>
                        <Text style={styles.headerTitle}>{modeInfo.title}</Text>
                    </View>
                    <View style={styles.sessionCounter}>
                        <Text style={styles.sessionText}>
                            {completedPomodoros} / {settings.sessionsUntilLongBreak}
                        </Text>
                    </View>
                </View>

                {/* Aktif Kategori Göstergesi */}
                <View style={styles.activeCategoryContainer}>
                    {activeCategory ? (
                        <View style={styles.activeCategoryBadge}>
                            <Text style={styles.activeCategoryIcon}>{activeCategory.icon}</Text>
                            <Text style={styles.activeCategoryText}>{activeCategory.name}</Text>
                        </View>
                    ) : (
                        <View style={[styles.activeCategoryBadge, styles.noCategoryBadge]}>
                            <Ionicons name="alert-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.activeCategoryText}>Kategori Seçilmedi</Text>
                        </View>
                    )}
                </View>

                {/* Mod Seçici */}
                <View style={styles.modeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            currentMode === TIMER_MODES.POMODORO && styles.modeButtonActive,
                        ]}
                        onPress={() => !isActive && switchMode(TIMER_MODES.POMODORO)}
                        disabled={isActive}
                    >
                        <Text
                            style={[
                                styles.modeButtonText,
                                currentMode === TIMER_MODES.POMODORO && styles.modeButtonTextActive,
                            ]}
                        >
                            Pomodoro
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            currentMode === TIMER_MODES.SHORT_BREAK && styles.modeButtonActive,
                        ]}
                        onPress={() => !isActive && switchMode(TIMER_MODES.SHORT_BREAK)}
                        disabled={isActive}
                    >
                        <Text
                            style={[
                                styles.modeButtonText,
                                currentMode === TIMER_MODES.SHORT_BREAK && styles.modeButtonTextActive,
                            ]}
                        >
                            Kısa Mola
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            currentMode === TIMER_MODES.LONG_BREAK && styles.modeButtonActive,
                        ]}
                        onPress={() => !isActive && switchMode(TIMER_MODES.LONG_BREAK)}
                        disabled={isActive}
                    >
                        <Text
                            style={[
                                styles.modeButtonText,
                                currentMode === TIMER_MODES.LONG_BREAK && styles.modeButtonTextActive,
                            ]}
                        >
                            Uzun Mola
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.bottomSection}>
                <View style={styles.waveEffect} />

                {/* Timer */}
                <View style={styles.timerWrapper}>
                    <View style={styles.timerCircle}>
                        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                            <Defs>
                                <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                    <Stop offset="0" stopColor={modeInfo.color[0]} stopOpacity="1" />
                                    <Stop offset="1" stopColor={modeInfo.color[1]} stopOpacity="1" />
                                </SvgLinearGradient>
                            </Defs>
                            <Circle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={RADIUS}
                                stroke="#f0f0f0"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                            />
                            <Circle
                                cx={CIRCLE_SIZE / 2}
                                cy={CIRCLE_SIZE / 2}
                                r={RADIUS}
                                stroke="url(#grad)"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                            />
                        </Svg>

                        <View style={styles.timerTextContainer}>
                            <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
                            <Text style={styles.timerLabel}>{modeInfo.label}</Text>
                            {currentMode === TIMER_MODES.POMODORO && distractionCount > 0 && (
                                <Text style={styles.distractionText}>⚠️ {distractionCount} dikkat dağınıklığı</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Uyarı Mesajı */}
                {isActive && currentMode === TIMER_MODES.POMODORO && (
                    <View style={styles.warningContainer}>
                        <Ionicons name="information-circle-outline" size={16} color="#999" />
                        <Text style={styles.warningText}>
                            Uygulamadan çıkarsanız dikkat dağınıklığı sayılacak!
                        </Text>
                    </View>
                )}

                <View style={styles.controlsContainer}>
                    {!isActive ? (
                        <TouchableOpacity style={styles.mainButton} onPress={handleStart}>
                            <Ionicons name="play" size={24} color="white" style={{ marginRight: 10 }} />
                            <Text style={styles.mainButtonText}>Başlat</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.activeControls}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: modeInfo.color[1] }]}
                                onPress={handlePause}
                            >
                                <Ionicons name="pause" size={24} color="white" />
                                <Text style={styles.actionButtonText}>Duraklat</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: modeInfo.color[0] }]}
                                onPress={handleReset}
                            >
                                <Ionicons name="stop" size={24} color="white" />
                                <Text style={styles.actionButtonText}>Bitir</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Süre Ayarlama */}
                    {!isActive && (
                        <View style={styles.timeAdjustmentContainer}>
                            <TouchableOpacity style={styles.adjustButton} onPress={() => adjustTime(-5)}>
                                <Ionicons name="remove" size={20} color={modeInfo.color[0]} />
                                <Text style={[styles.adjustButtonText, { color: modeInfo.color[0] }]}>5 dk</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.adjustButton} onPress={() => adjustTime(5)}>
                                <Ionicons name="add" size={20} color={modeInfo.color[0]} />
                                <Text style={[styles.adjustButtonText, { color: modeInfo.color[0] }]}>5 dk</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* İstatistikler */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={styles.statValue}>{completedPomodoros}</Text>
                        <Text style={styles.statLabel}>Tamamlanan</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="timer" size={24} color="#FF9800" />
                        <Text style={styles.statValue}>{settings.pomodoroMinutes}</Text>
                        <Text style={styles.statLabel}>Dakika</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="alert-circle" size={24} color={distractionCount > 0 ? "#F44336" : "#999"} />
                        <Text style={[styles.statValue, distractionCount > 0 && { color: '#F44336' }]}>
                            {distractionCount}
                        </Text>
                        <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
                    </View>
                </View>
            </View>

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
        backgroundColor: '#fff',
    },
    headerBackground: {
        flex: 0.65,
        paddingTop: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modeIcon: {
        fontSize: 28,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    sessionCounter: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    sessionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeCategoryContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    activeCategoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    noCategoryBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    activeCategoryIcon: {
        fontSize: 20,
    },
    activeCategoryText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modeSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 15,
        width: '100%',
    },
    modeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    modeButtonActive: {
        backgroundColor: 'white',
    },
    modeButtonText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        fontWeight: '600',
    },
    modeButtonTextActive: {
        color: '#FF6B6B',
    },
    timerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -CIRCLE_SIZE / 1,
        zIndex: 10,
    },
    timerCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    timerTextContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    timerValue: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#333',
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
    distractionText: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 5,
        fontWeight: '600',
    },
    bottomSection: {
        flex: 0.35,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        paddingTop: 40,
    },
    waveEffect: {
        position: 'absolute',
        top: -30,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    warningText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    controlsContainer: {
        width: '100%',
        paddingHorizontal: 30,
        marginTop: 10,
        marginBottom: 20,
    },
    mainButton: {
        backgroundColor: '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    mainButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    activeControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 0.48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    timeAdjustmentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
        gap: 15,
    },
    adjustButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FF6B6B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    adjustButtonText: {
        color: '#FF6B6B',
        fontWeight: 'bold',
        marginLeft: 5,
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});

export default TimerScreen;