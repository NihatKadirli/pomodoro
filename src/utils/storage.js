import AsyncStorage from '@react-native-async-storage/async-storage';

// Verilerin saklanacağı anahtar
const SESSIONS_KEY = '@pomodoro_sessions';

/**
 * Yeni bir seansı kaydeder.
 * @param {Object} sessionData - Kaydedilecek seans verileri
 * @returns {Promise<Object>} - Kaydedilen seans objesi veya hata
 */
export const saveSession = async (sessionData) => {
    try {
        // Benzersiz bir ID oluştur
        const newSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...sessionData
        };

        // Mevcut seansları getir
        const existingSessionsJSON = await AsyncStorage.getItem(SESSIONS_KEY);
        const existingSessions = existingSessionsJSON ? JSON.parse(existingSessionsJSON) : [];

        // Yeni seansı ekle
        existingSessions.push(newSession);

        // Güncellenmiş listeyi kaydet
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(existingSessions));

        console.log('✅ Seans başarıyla kaydedildi:', newSession);
        return { success: true, data: newSession };
    } catch (error) {
        console.error('❌ Seans kaydedilirken hata oluştu:', error);
        return { success: false, error };
    }
};

/**
 * Kayıtlı tüm seansları getirir.
 * @returns {Promise<Array>} - Tarihe göre sıralanmış seans listesi (En yeni en üstte)
 */
export const getAllSessions = async () => {
    try {
        const sessionsJSON = await AsyncStorage.getItem(SESSIONS_KEY);
        const sessions = sessionsJSON ? JSON.parse(sessionsJSON) : [];

        // Tarihe göre tersten sırala (En yeni en başta)
        return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('❌ Seanslar getirilirken hata oluştu:', error);
        return [];
    }
};

/**
 * Sadece bugüne ait seansları getirir.
 * @returns {Promise<Array>} - Bugünün seansları
 */
export const getTodaySessions = async () => {
    try {
        const allSessions = await getAllSessions();
        const today = new Date();

        // Bugünün başlangıcı (00:00:00)
        today.setHours(0, 0, 0, 0);

        // Bugünün bitişi (23:59:59)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return allSessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= today && sessionDate < tomorrow;
        });
    } catch (error) {
        console.error('❌ Bugünün seansları getirilirken hata:', error);
        return [];
    }
};

/**
 * Belirli bir tarih aralığındaki seansları getirir.
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Date} endDate - Bitiş tarihi
 * @returns {Promise<Array>} - Filtrelenmiş seanslar
 */
export const getSessionsByDateRange = async (startDate, endDate) => {
    try {
        const allSessions = await getAllSessions();

        return allSessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
    } catch (error) {
        console.error('❌ Tarih aralığına göre seanslar getirilirken hata:', error);
        return [];
    }
};

/**
 * Tüm seans geçmişini siler (Debug ve Test için).
 * @returns {Promise<boolean>} - Başarı durumu
 */
export const deleteAllSessions = async () => {
    try {
        await AsyncStorage.removeItem(SESSIONS_KEY);
        console.log('🗑️ Tüm seanslar silindi.');
        return true;
    } catch (error) {
        console.error('❌ Seanslar silinirken hata:', error);
        return false;
    }
};
