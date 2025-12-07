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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { usePet } from '../context/PetContext';
import ThemePicker from '../components/ThemePicker';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

export default function SettingsScreen() {
    const { settings, saveSettings, resetSettings, categories, addCategory, deleteCategory, resetCategories, activeCategory, changeActiveCategory } = useSettings();
    const { theme } = useTheme();
    const { showAlert, hideAlert, alertConfig } = useCustomAlert();

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
            showAlert({ title: 'Hata', message: 'Lütfen geçerli bir sayı girin', type: 'error' });
            return;
        }

        // Maksimum değer kontrolleri
        if (editingSetting.key === 'pomodoroMinutes' && numValue > 60) {
            showAlert({ title: 'Hata', message: 'Pomodoro süresi maksimum 60 dakika olabilir', type: 'error' });
            return;
        }
        if (editingSetting.key.includes('Break') && numValue > 30) {
            showAlert({ title: 'Hata', message: 'Mola süresi maksimum 30 dakika olabilir', type: 'error' });
            return;
        }
        if (editingSetting.key === 'sessionsUntilLongBreak' && numValue > 10) {
            showAlert({ title: 'Hata', message: 'Seans sayısı maksimum 10 olabilir', type: 'error' });
            return;
        }

        saveSettings({ [editingSetting.key]: numValue });
        setModalVisible(false);
    };

    const handleResetSettings = () => {
        showAlert({
            title: 'Ayarları Sıfırla',
            message: 'Tüm ayarlar varsayılan değerlere döndürülecek. Emin misiniz?',
            type: 'warning',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    onPress: resetSettings,
                },
            ]
        });
    };

    // Kategori yönetimi fonksiyonları
    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            showAlert({ title: 'Hata', message: 'Lütfen kategori adı girin', type: 'error' });
            return;
        }

        const success = await addCategory(categoryName.trim(), selectedEmoji);
        if (success) {
            setCategoryName('');
            setSelectedEmoji('📚');
            setCategoryModalVisible(false);
            setEmojiPickerVisible(false);
            showAlert({ title: 'Başarılı', message: 'Kategori eklendi', type: 'success' });
        } else {
            showAlert({ title: 'Hata', message: 'Kategori eklenirken bir hata oluştu', type: 'error' });
        }
    };

    const handleDeleteCategory = (category) => {
        if (category.isDefault) {
            showAlert({ title: 'Uyarı', message: 'Varsayılan kategoriler silinemez', type: 'warning' });
            return;
        }

        showAlert({
            title: 'Kategoriyi Sil',
            message: `"${category.name}" kategorisini silmek istediğinize emin misiniz?`,
            type: 'warning',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    onPress: async () => {
                        const success = await deleteCategory(category.id);
                        if (!success) {
                            showAlert({ title: 'Hata', message: 'Kategori silinirken bir hata oluştu', type: 'error' });
                        }
                    },
                },
            ]
        });
    };

    const handleResetCategories = () => {
        showAlert({
            title: 'Kategorileri Sıfırla',
            message: 'Tüm özel kategoriler silinecek ve varsayılan kategorilere dönülecek. Emin misiniz?',
            type: 'warning',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    onPress: resetCategories,
                },
            ]
        });
    };

    const SettingItem = ({ icon, title, value, onPress }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={24} color={theme.colors.primary} />
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
            </View>
            <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.colors.subText }]}>{value}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.subText} />
            </View>
        </TouchableOpacity>
    );

    const SettingSwitch = ({ icon, title, value, onValueChange }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={24} color={theme.colors.primary} />
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={value ? theme.colors.primary : '#f4f3f4'}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient colors={theme.gradient} style={styles.header}>
                <Ionicons name="settings" size={32} color="#fff" />
                <Text style={styles.headerTitle}>Ayarlar</Text>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Tema Ayarları */}
                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🎨 Görünüm</Text>
                    <ThemePicker />
                </View>

                {/* Zaman Ayarları */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>⏱️ Zaman Ayarları</Text>
                    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                        <SettingItem
                            icon="timer"
                            title="Pomodoro Süresi"
                            value={`${settings.pomodoroMinutes} dakika`}
                            onPress={() =>
                                openEditModal('pomodoroMinutes', settings.pomodoroMinutes, 'Pomodoro Süresi')
                            }
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <SettingItem
                            icon="cafe"
                            title="Kısa Mola"
                            value={`${settings.shortBreakMinutes} dakika`}
                            onPress={() =>
                                openEditModal('shortBreakMinutes', settings.shortBreakMinutes, 'Kısa Mola Süresi')
                            }
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <SettingItem
                            icon="sunny"
                            title="Uzun Mola"
                            value={`${settings.longBreakMinutes} dakika`}
                            onPress={() =>
                                openEditModal('longBreakMinutes', settings.longBreakMinutes, 'Uzun Mola Süresi')
                            }
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <SettingItem
                            icon="repeat"
                            title="Uzun Mola İçin Seans Sayısı"
                            value={`${settings.sessionsUntilLongBreak} seans`}
                            onPress={() =>
                                openEditModal(
                                    'sessionsUntilLongBreak',
                                    settings.sessionsUntilLongBreak,
                                    'Uzun Mola İçin Seans Sayısı'
                                )
                            }
                        />
                    </View>
                </View>

                {/* Diğer Ayarlar */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>⚙️ Genel</Text>
                    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                        <SettingSwitch
                            icon="play-circle"
                            title="Molaları Otomatik Başlat"
                            value={settings.autoStartBreaks}
                            onValueChange={(value) => saveSettings({ autoStartBreaks: value })}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <SettingSwitch
                            icon="timer"
                            title="Pomodoroları Otomatik Başlat"
                            value={settings.autoStartPomodoros}
                            onValueChange={(value) => saveSettings({ autoStartPomodoros: value })}
                        />
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <SettingSwitch
                            icon="notifications"
                            title="Titreşim"
                            value={settings.vibrationEnabled}
                            onValueChange={(value) => saveSettings({ vibrationEnabled: value })}
                        />
                    </View>
                </View>

                {/* Kategori Yönetimi */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>🏷️ Kategoriler</Text>
                        <TouchableOpacity onPress={handleResetCategories}>
                            <Text style={{ color: theme.colors.subText, fontSize: 12 }}>Sıfırla</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.colors.card, padding: 0 }]}>
                        {categories.map((category, index) => (
                            <View key={category.id} >
                                <View style={styles.categoryItem}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 24, marginRight: 10 }}>{category.icon}</Text>
                                        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{category.name}</Text>
                                        {category.isDefault && <Text style={{ fontSize: 10, color: theme.colors.subText, marginLeft: 6 }}>(Varsayılan)</Text>}
                                    </View>
                                    {!category.isDefault && (
                                        <TouchableOpacity onPress={() => handleDeleteCategory(category)} style={{ padding: 5 }}>
                                            <Ionicons name="trash-outline" size={20} color="#FF6347" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {index < categories.length - 1 && <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />}
                            </View>
                        ))}
                        <TouchableOpacity
                            style={styles.addCategoryButton}
                            onPress={() => setCategoryModalVisible(true)}
                        >
                            <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.settingTitle, { color: theme.colors.primary }]}>Yeni Kategori Ekle</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sıfırlama Butonu */}
                <TouchableOpacity onPress={handleResetSettings} style={[styles.resetButton, { borderColor: '#F44336' }]}>
                    <Text style={styles.resetButtonText}>Tüm Ayarları Sıfırla</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Düzenleme Modalı */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{editingSetting?.title}</Text>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
                            keyboardType="number-pad"
                            value={tempValue}
                            onChangeText={setTempValue}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                                onPress={saveEditedValue}
                            >
                                <Text style={[styles.buttonText, { color: '#fff' }]}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Kategori Ekleme Modalı */}
            <Modal
                visible={categoryModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCategoryModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.categoryModalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Yeni Kategori</Text>
                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: theme.colors.subText }]}>İkon Seç</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiList}>
                            {EMOJI_OPTIONS.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={[
                                        styles.emojiItem,
                                        selectedEmoji === emoji && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary, borderWidth: 1 }
                                    ]}
                                    onPress={() => setSelectedEmoji(emoji)}
                                >
                                    <Text style={{ fontSize: 28 }}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.label, { color: theme.colors.subText }]}>Kategori Adı</Text>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
                            placeholder="Örn: Spor, Okuma..."
                            placeholderTextColor={theme.colors.subText}
                            value={categoryName}
                            onChangeText={setCategoryName}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleAddCategory}
                        >
                            <Text style={styles.saveButtonText}>Ekle</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Custom Alert Component */}
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 16,
        marginLeft: 12,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        marginRight: 8,
    },
    divider: {
        height: 1,
        marginLeft: 50,
    },
    resetButton: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 20,
    },
    resetButtonText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Kategori stilleri
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    addCategoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginTop: 5,
    },
    categoryModalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 10,
        fontWeight: '600',
    },
    emojiList: {
        flexDirection: 'row',
        marginBottom: 20,
        maxHeight: 60,
    },
    emojiItem: {
        padding: 10,
        borderRadius: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    saveButton: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
