import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        if (!username || !password) {
            Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifreyi giriniz.');
            return;
        }

        setIsLoading(true);

        // Simüle edilmiş ağ isteği
        setTimeout(() => {
            setIsLoading(false);
            if (username.toLowerCase() === 'nihat' && password === '12345') {
                navigation.navigate('OTP');
            } else {
                Alert.alert('Hata', 'Hatalı kullanıcı adı veya şifre!');
            }
        }, 1500);
    };

    return (
        <LinearGradient colors={['#e11515ff', '#a90052ff']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person" size={40} color="#764ba2" />
                    </View>
                    <Text style={styles.title}>Hoş Geldiniz! 👋</Text>
                    <Text style={styles.subtitle}>Odaklanma yolculuğunuza devam edin</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={24} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Kullanıcı Adı"
                            placeholderTextColor="#ccc"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={24} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre"
                            placeholderTextColor="#ccc"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerLink}>
                        <Text style={styles.registerText}>Hesabınız yok mu? <Text style={styles.registerHighlight}>Kayıt Olun</Text></Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: 'white',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#FF6B6B',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    registerText: {
        color: 'white',
        fontSize: 14,
    },
    registerHighlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
