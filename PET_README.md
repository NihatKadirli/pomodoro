# 🐾 Pomodoro Focus Pet Sistemi

Bu modül, Pomodoro uygulamanıza "Gamification" (Oyunlaştırma) özellikleri ekleyen bir sanal evcil hayvan sistemidir.

## 📁 Klasör Yapısı
- `src/constants/petTypes.js`: Pet türleri, seviyeler ve özellikler.
- `src/utils/petCalculations.js`: XP ve Level hesaplama mantığı.
- `src/context/PetContext.js`: Global state yönetimi ve veri saklama (AsyncStorage).
- `src/components/pet/`: Görsel bileşenler ve animasyonlar.

## 🚀 Nasıl Çalışır?

### 1. XP ve Level Sistemi
- **Normal Seans:** Her 5 dakika için 10 XP.
- **Tam Seans (25dk+):** +50 XP Bonus.
- **Kusursuz Seans:** Hiç dikkat dağılmazsa +20 XP Bonus.
- **Level Atlama:** Belirli XP eşiklerine gelince (örn: 50, 150, 300) pet seviye atlar ve büyür.

### 2. Mutluluk ve Sağlık
- **Mutluluk:** Seans tamamlayınca artar (+15). Dikkat dağılırsa azalır (-10).
- **Etkileşim:** Pet'in üzerine tıklayarak onu sevebilirsiniz (+5 Mutluluk).

### 3. Pet Türleri
- **Kedi (Varsayılan):** Başlangıçta açık.
- **Köpek:** 100 dakika odaklanma gerektirir.
- **Ejderha:** 500 dakika odaklanma gerektirir.
- **Robot:** 1000 dakika odaklanma gerektirir.
- **Unicorn:** 2000 dakika odaklanma gerektirir.

## 🛠️ Geliştirici Notları

### Pet Ekleme/Değiştirme
`src/constants/petTypes.js` dosyasında yeni bir obje tanımlayarak yeni pet türleri ekleyebilirsiniz.
Görselini çizmek için `src/components/pet/PetAvatar.js` dosyasına yeni bir `View` çizimi eklemelisiniz.

### Styling
Pet çizimleri `react-native-svg` yerine saf `View` ve `StyleSheet` (CSS Art) kullanılarak yapılmıştır. Bu sayede harici kütüphane bağımlılığı yoktur ve her cihazda sorunsuz çalışır.

### Veri Saklama
Tüm veriler `AsyncStorage` üzerinde `@pomodoro_pet_state` anahtarı ile JSON formatında saklanır.
