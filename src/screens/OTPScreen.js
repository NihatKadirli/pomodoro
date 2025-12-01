import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPScreen = ({ navigation }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef([]);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Otomatik focus geçişi
        if (value && index < 3) {
            inputs.current[index + 1].focus();
        }

        // 4 hane girildi mi kontrol et
        if (index === 3 && value) {
            // State güncellemesi asenkron olduğu için newOtp kullanıyoruz
            validateOtp(newOtp.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const validateOtp = async (code) => {
        if (code === '1234') {
            try {
                await AsyncStorage.setItem('isLoggedIn', 'true');
                Alert.alert('Başarılı', 'Giriş başarılı!', [
                    { text: 'Tamam', onPress: () => navigation.replace('MainApp') }
                ]);
            } catch (error) {
                console.log('Error saving login status:', error);
            }
        } else {
            shake();
            Alert.alert('Hata', 'Hatalı kod! Lütfen tekrar deneyin.');
            setOtp(['', '', '', '']);
            inputs.current[0].focus();
        }
    };

    return (
        <LinearGradient colors={['#4a4a4aff', '#b04856ff']} style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark" size={50} color="#f5576c" />
                </View>

                <Text style={styles.title}>Güvenlik Kodu 🔐</Text>
                <Text style={styles.subtitle}>Telefonunuza gönderilen 4 haneli kodu giriniz</Text>

                <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => inputs.current[index] = ref}
                            style={[
                                styles.otpInput,
                                { borderColor: digit ? '#FF6B6B' : '#ddd' }
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </Animated.View>

                <TouchableOpacity style={styles.resendButton}>
                    <Text style={styles.resendText}>Kodu Tekrar Gönder (30s)</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        backgroundColor: 'white',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpInput: {
        width: 60,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 15,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        color: '#333',
    },
    resendButton: {
        padding: 10,
    },
    resendText: {
        color: 'white',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default OTPScreen;
