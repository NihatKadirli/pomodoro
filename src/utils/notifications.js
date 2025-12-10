import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Bildirim davranış ayarları (Uygulama açıkken nasıl görüneceği)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// İzinleri al ve kaydet
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Bildirim izni alınamadı!');
            return;
        }
    } else {
        console.log('Fiziksel cihaz kullanmalısınız.');
    }
}

// "Geri Dön" Bildirimi Planla
export async function scheduleComeBackNotification() {
    // Önceki benzer bildirimleri temizle (üst üste binmesin diye)
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "⚠️ Odaklanma Bozuldu!",
            body: "Sayaç durduruldu. Seansına devam etmek için hemen geri dön! 🏃‍♂️",
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { type: 'distraction_alert' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2, // Çıktıktan 2 saniye sonra
        },
    });
}

// Bildirimleri İptal Et (Geri gelince çalışır)
export async function cancelNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
