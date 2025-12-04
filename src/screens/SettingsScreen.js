import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen() {
    const { settings, saveSettings, resetSettings, categories, addCategory, deleteCategory, resetCategories, activeCategory, changeActiveCategory } = useSettings();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSetting, setEditingSetting] = useState(null);
    const [tempValue, setTempValue] = useState('');

    // Kategori yönetimi için state'ler
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('📚');
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

    // Emoji seçenekleri
    const EMOJI_OPTIONS = [
        '📚', '💻', '📁', '📖', '✏️', '🎨', '🎵', '🏃',
        '🍳', '🧹', '🛒', '💼', '📧', '📱', '🎯', '⚡',
        '🔥', '💡', '🎓', '🏆', '📝', '🎬', '📷', '🎮'
    ];

    const openEditModal = (settingKey, currentValue, title) => {
        setEditingSetting({ key: settingKey, title });
        setTempValue(currentValue.toString());
        setModalVisible(true);
    };

    const saveEditedValue = () => {
        const numValue = parseInt(tempValue);
        if (isNaN(numValue) || numValue <= 0) {
            Alert.alert('Hata', 'Lütfen geçerli bir sayı girin');
            return;
        }

        // Maksimum değer kontrolleri
        if (editingSetting.key === 'pomodoroMinutes' && numValue > 60) {
            Alert.alert('Hata', 'Pomodoro süresi maksimum 60 dakika olabilir');
            return;
        }
        if (editingSetting.key.includes('Break') && numValue > 30) {
            Alert.alert('Hata', 'Mola süresi maksimum 30 dakika olabilir');
            return;
        }
        if (editingSetting.key === 'sessionsUntilLongBreak' && numValue > 10) {
            Alert.alert('Hata', 'Seans sayısı maksimum 10 olabilir');
            return;
        }

        saveSettings({ [editingSetting.key]: numValue });
        setModalVisible(false);
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Ayarları Sıfırla',
            'Tüm ayarlar varsayılan değerlere döndürülecek. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: resetSettings,
                },
            ]
        );
    };

    // Kategori yönetimi fonksiyonları
    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Hata', 'Lütfen kategori adı girin');
            return;
        }

        const success = await addCategory(categoryName.trim(), selectedEmoji);
        if (success) {
            setCategoryName('');
            setSelectedEmoji('📚');
            setCategoryModalVisible(false);
            setEmojiPickerVisible(false);
            Alert.alert('Başarılı', 'Kategori eklendi');
        } else {
            Alert.alert('Hata', 'Kategori eklenirken bir hata oluştu');
        }
    };

    const handleDeleteCategory = (category) => {
        if (category.isDefault) {
            Alert.alert('Uyarı', 'Varsayılan kategoriler silinemez');
            return;
        }

        Alert.alert(
            'Kategoriyi Sil',
            `"${category.name}" kategorisini silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteCategory(category.id);
                        if (!success) {
                            Alert.alert('Hata', 'Kategori silinirken bir hata oluştu');
                        }
                    },
                },
            ]
        );
    };

    const handleResetCategories = () => {
        Alert.alert(
            'Kategorileri Sıfırla',
            'Tüm özel kategoriler silinecek ve varsayılan kategorilere dönülecek. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: resetCategories,
                },
            ]
        );
    };

    const SettingItem = ({ icon, title, value, onPress, type = 'number' }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={24} color="#FF6347" />
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{value}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
        </TouchableOpacity>
    );

    const SettingSwitch = ({ icon, title, value, onValueChange }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={24} color="#FF6347" />
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#ddd', true: '#FF634780' }}
                thumbColor={value ? '#FF6347' : '#f4f3f4'}
            />
        </View>
    );

    return (
        <LinearGradient colors={['#FF6347', '#FF8C69']} style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="settings" size={32} color="#fff" />
                <Text style={styles.headerTitle}>Ayarlar</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Zaman Ayarları */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏱️ Zaman Ayarları</Text>
                    <View style={styles.card}>
                        <SettingItem
                            icon="timer"
                            title="Pomodoro Süresi"
                            value={`${settings.pomodoroMinutes} dakika`}
                            onPress={() =>
                                openEditModal('pomodoroMinutes', settings.pomodoroMinutes, 'Pomodoro Süresi')
                            }
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="cafe"
                            title="Kısa Mola"
                            value={`${settings.shortBreakMinutes} dakika`}
                            onPress={() =>
                                openEditModal('shortBreakMinutes', settings.shortBreakMinutes, 'Kısa Mola Süresi')
                            }
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="sunny"
                            title="Uzun Mola"
                            value={`${settings.longBreakMinutes} dakika`}
                            onPress={() =>
                                openEditModal('longBreakMinutes', settings.longBreakMinutes, 'Uzun Mola Süresi')
                            }
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="repeat"
                            title="Uzun Mola İçin Seans Sayısı"
                            value={`${settings.sessionsUntilLongBreak} seans`}
                            onPress={() =>
                                openEditModal(
                                    'sessionsUntilLongBreak',
                                    settings.sessionsUntilLongBreak,
                                    'Seans Sayısı'
                                )
                            }
                        />
                    </View>
                </View>

                {/* Otomatik Başlatma */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🚀 Otomatik Başlatma</Text>
                    <View style={styles.card}>
                        <SettingSwitch
                            icon="play-circle"
                            title="Molaları Otomatik Başlat"
                            value={settings.autoStartBreaks}
                            onValueChange={(value) => saveSettings({ autoStartBreaks: value })}
                        />
                        <View style={styles.divider} />
                        <SettingSwitch
                            icon="play-circle-outline"
                            title="Pomodoro'ları Otomatik Başlat"
                            value={settings.autoStartPomodoros}
                            onValueChange={(value) => saveSettings({ autoStartPomodoros: value })}
                        />
                    </View>
                </View>

                {/* Bildirimler */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔔 Bildirimler</Text>
                    <View style={styles.card}>
                        <SettingSwitch
                            icon="volume-high"
                            title="Ses Bildirimleri"
                            value={settings.soundEnabled}
                            onValueChange={(value) => saveSettings({ soundEnabled: value })}
                        />
                        <View style={styles.divider} />
                        <SettingSwitch
                            icon="phone-portrait"
                            title="Titreşim"
                            value={settings.vibrationEnabled}
                            onValueChange={(value) => saveSettings({ vibrationEnabled: value })}
                        />
                    </View>
                </View>

                {/* Kategori Yönetimi */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📂 Kategoriler</Text>
                        <TouchableOpacity
                            style={styles.addCategoryButton}
                            onPress={() => setCategoryModalVisible(true)}
                        >
                            <Ionicons name="add-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.card}>
                        {categories.map((category, index) => (
                            <View key={category.id}>
                                {index > 0 && <View style={styles.divider} />}
                                <TouchableOpacity
                                    style={[
                                        styles.categoryItem,
                                        activeCategory?.id === category.id && styles.activeCategoryItem
                                    ]}
                                    onPress={() => changeActiveCategory(category)}
                                >
                                    <View style={styles.categoryLeft}>
                                        <Text style={styles.categoryEmoji}>{category.icon}</Text>
                                        <View style={styles.categoryInfo}>
                                            <Text style={styles.categoryName}>{category.name}</Text>
                                            {category.isDefault && (
                                                <View style={styles.defaultBadge}>
                                                    <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                                                </View>
                                            )}
                                        </View>
                                        {activeCategory?.id === category.id && (
                                            <View style={styles.activeIndicator}>
                                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                                <Text style={styles.activeText}>Aktif</Text>
                                            </View>
                                        )}
                                    </View>
                                    {!category.isDefault && (
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCategory(category);
                                            }}
                                            style={styles.deleteIconButton}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#F44336" />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.resetCategoriesButton}
                        onPress={handleResetCategories}
                    >
                        <Ionicons name="refresh" size={18} color="#fff" />
                        <Text style={styles.resetCategoriesText}>Kategorileri Sıfırla</Text>
                    </TouchableOpacity>
                </View>

                {/* Pomodoro Tekniği Bilgisi */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🍅 Pomodoro Tekniği</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            Pomodoro Tekniği, 25 dakikalık odaklanma seansları ve kısa molalarla çalışmanızı
                            optimize eder.
                        </Text>
                        <Text style={styles.infoText}>
                            {'\n'}• 25 dakika odaklanarak çalışın{'\n'}• 5 dakika kısa mola verin{'\n'}• 4
                            seans sonra 15-30 dakika uzun mola yapın
                        </Text>
                    </View>
                </View>

                {/* Sıfırla Butonu */}
                <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.resetButtonText}>Varsayılan Ayarlara Dön</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Düzenleme Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingSetting?.title}</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={tempValue}
                            onChangeText={setTempValue}
                            keyboardType="number-pad"
                            placeholder="Değer girin"
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveEditedValue}
                            >
                                <Text style={styles.saveButtonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Kategori Ekleme Modal */}
            <Modal
                visible={categoryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setCategoryModalVisible(false);
                    setCategoryName('');
                    setSelectedEmoji('📚');
                    setEmojiPickerVisible(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Yeni Kategori</Text>

                        {/* Emoji Seçici */}
                        <TouchableOpacity
                            style={styles.emojiSelector}
                            onPress={() => setEmojiPickerVisible(!emojiPickerVisible)}
                        >
                            <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
                            <Text style={styles.emojiSelectorText}>Emoji Seç</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        {emojiPickerVisible && (
                            <View style={styles.emojiPicker}>
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={styles.emojiOption}
                                        onPress={() => {
                                            setSelectedEmoji(emoji);
                                            setEmojiPickerVisible(false);
                                        }}
                                    >
                                        <Text style={styles.emojiOptionText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Kategori Adı */}
                        <TextInput
                            style={styles.modalInput}
                            value={categoryName}
                            onChangeText={setCategoryName}
                            placeholder="Kategori adı (örn: Yemek Yapma)"
                            placeholderTextColor="#999"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setCategoryModalVisible(false);
                                    setCategoryName('');
                                    setSelectedEmoji('📚');
                                    setEmojiPickerVisible(false);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleAddCategory}
                            >
                                <Text style={styles.saveButtonText}>Ekle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 52,
    },
    infoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    resetButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 20,
        marginTop: 10,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 2,
        borderColor: '#FF6347',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#FF6347',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Kategori Yönetimi Stilleri
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addCategoryButton: {
        padding: 4,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    categoryEmoji: {
        fontSize: 24,
    },
    categoryName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    categoryInfo: {
        flex: 1,
    },
    activeCategoryItem: {
        backgroundColor: '#F0FFF4',
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 8,
    },
    activeText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    defaultBadge: {
        backgroundColor: '#FFE5E5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    defaultBadgeText: {
        fontSize: 11,
        color: '#FF6347',
        fontWeight: '600',
    },
    deleteIconButton: {
        padding: 8,
    },
    resetCategoriesButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 0,
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    resetCategoriesText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // Emoji Seçici Stilleri
    emojiSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF6347',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 12,
    },
    selectedEmoji: {
        fontSize: 32,
    },
    emojiSelectorText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    emojiPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
    },
    emojiOption: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    emojiOptionText: {
        fontSize: 24,
    },
});
