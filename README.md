# 🍅 Pomodoro - Üretkenlik ve Odaklanma Uygulaması

Modern ve kullanıcı dostu bir Pomodoro zamanlayıcı uygulaması. React Native ve Expo ile geliştirilmiş, gamification özellikleri ve sanal evcil hayvan sistemi ile üretkenliğinizi artırın!

## 📱 Özellikler

### ⏱️ Pomodoro Zamanlayıcı
- **Özelleştirilebilir Süre Ayarları**: Çalışma, kısa mola ve uzun mola sürelerini kendinize göre ayarlayın
- **Otomatik Geçişler**: Pomodoro tamamlandığında otomatik olarak mola süresine geçiş
- **Bildirimler**: Push notification desteği ile süre bitiminde hatırlatmalar
- **Ekran Açık Tutma**: Zamanlayıcı çalışırken ekranın kilitlenmesini önleme
- **Haptic Feedback**: Titreşim geri bildirimleri ile daha iyi kullanıcı deneyimi

### 📊 Raporlar ve İstatistikler
- **Günlük/Haftalık/Aylık Görünümler**: Üretkenliğinizi farklı zaman dilimlerinde takip edin
- **Görsel Grafikler**: Çalışma sürelerinizi çizgi grafikleri ile görselleştirin
- **Rozet Sistemi**: Başarılarınızı rozetler kazanarak kutlayın
- **İstatistikler**: Toplam çalışma süresi, tamamlanan pomodoro sayısı ve daha fazlası

### 🐾 Sanal Evcil Hayvan (Pet)
- **Etkileşimli Pet Sistemi**: Çalışarak puanlar kazanın ve petinizi besleyin
- **Seviye Sistemi**: Petiniz çalışmalarınızla birlikte gelişir
- **Duygusal Durumlar**: Petinizin mutluluk seviyesini takip edin
- **Ödüller**: Başarılarınızla petinizi mutlu edin

### 🎯 Rozet ve Başarı Sistemi
- **Çeşitli Rozetler**: 
  - İlk Adım (1 pomodoro)
  - Başlangıç (5 pomodoro)
  - Kararlı (10 pomodoro)
  - Odaklanmış (25 pomodoro)
  - Uzman (50 pomodoro)
  - Usta (100 pomodoro)
  - Efsane (200 pomodoro)
- **Rozet Galerisi**: Kazandığınız tüm rozetleri görüntüleyin
- **Unlock Animasyonları**: Yeni rozet kazandığınızda konfeti efekti

### ⚙️ Ayarlar
- **Tema Seçimi**: Açık/Koyu tema desteği
- **Süre Özelleştirme**: Pomodoro, kısa mola ve uzun mola sürelerini ayarlayın
- **Bildirim Ayarları**: Push notification tercihlerinizi yönetin
- **Otomatik Başlatma**: Mola bitiminde otomatik olarak yeni pomodoro başlatma
- **Ses Ayarları**: Bildirim seslerini açma/kapatma

## 🚀 Kurulum

### Gereksinimler

Projeyi çalıştırmadan önce aşağıdaki yazılımların sisteminizde yüklü olması gerekmektedir:

- **Node.js** (v16 veya üzeri) - [İndir](https://nodejs.org/)
- **npm** veya **yarn** - Node.js ile birlikte gelir
- **Expo CLI** - `npm install -g expo-cli` komutu ile yüklenebilir
- **Expo Go** mobil uygulaması - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Adım 1: Projeyi Klonlayın

```bash
git clone <repository-url>
cd pomodoro
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

veya yarn kullanıyorsanız:

```bash
yarn install
```

### Adım 3: Uygulamayı Başlatın

```bash
npm start
```

veya:

```bash
expo start
```

Bu komut Expo Developer Tools'u açacaktır. Buradan uygulamayı farklı platformlarda çalıştırabilirsiniz:

## 📲 Uygulamayı Çalıştırma

### iOS Simulator'da Çalıştırma

```bash
npm run ios
```

veya Expo Developer Tools'da **"Run on iOS simulator"** butonuna tıklayın.

**Not**: iOS simulator sadece macOS'ta çalışır ve Xcode'un yüklü olması gerekir.

### Android Emulator'da Çalıştırma

```bash
npm run android
```

veya Expo Developer Tools'da **"Run on Android device/emulator"** butonuna tıklayın.

**Not**: Android Studio ve bir Android emulator'ün kurulu olması gerekir.

### Fiziksel Cihazda Çalıştırma

1. **Expo Go** uygulamasını mobil cihazınıza indirin:
   - [iOS için App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android için Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Bilgisayarınız ve mobil cihazınızın **aynı Wi-Fi ağında** olduğundan emin olun.

3. Expo Developer Tools'da gösterilen **QR kodu** tarayın:
   - **iOS**: Kamera uygulamasını açın ve QR kodu tarayın
   - **Android**: Expo Go uygulamasını açın ve "Scan QR Code" butonuna tıklayın

### Web'de Çalıştırma

```bash
npm run web
```

Uygulama tarayıcınızda `http://localhost:19006` adresinde açılacaktır.

## 📁 Proje Yapısı

```
pomodoro/
├── App.js                      # Ana uygulama dosyası ve navigasyon yapısı
├── app.json                    # Expo yapılandırma dosyası
├── package.json                # Proje bağımlılıkları
├── assets/                     # Görseller, ikonlar ve diğer statik dosyalar
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
└── src/
    ├── components/             # Yeniden kullanılabilir UI bileşenleri
    │   ├── BadgeGallery.js
    │   ├── BadgeSection.js
    │   ├── BadgeUnlockModal.js
    │   ├── PetAnimation.js
    │   ├── StatCard.js
    │   └── TimerDisplay.js
    ├── constants/              # Sabit değerler ve yapılandırmalar
    │   ├── badges.js           # Rozet tanımlamaları
    │   ├── colors.js           # Renk paleti
    │   ├── petStates.js        # Pet durumları
    │   └── themes.js           # Tema yapılandırmaları
    ├── context/                # React Context API state yönetimi
    │   ├── BadgeContext.js     # Rozet sistemi state'i
    │   ├── PetContext.js       # Pet sistemi state'i
    │   ├── SettingsContext.js  # Uygulama ayarları state'i
    │   └── ThemeContext.js     # Tema state'i
    ├── data/                   # Veri dosyaları
    │   └── badgeData.js        # Rozet verileri
    ├── hooks/                  # Custom React hooks
    │   └── useBadges.js        # Rozet yönetimi hook'u
    ├── screens/                # Uygulama ekranları
    │   ├── LoginScreen.js      # Giriş ekranı
    │   ├── OTPScreen.js        # OTP doğrulama ekranı
    │   ├── OnboardingScreen.js # Tanıtım ekranı
    │   ├── PetScreen.js        # Sanal evcil hayvan ekranı
    │   ├── ReportsScreen.js    # Raporlar ve istatistikler ekranı
    │   ├── SettingsScreen.js   # Ayarlar ekranı
    │   └── TimerScreen.js      # Pomodoro zamanlayıcı ekranı
    └── utils/                  # Yardımcı fonksiyonlar
        ├── notifications.js    # Push notification yönetimi
        ├── storage.js          # AsyncStorage yardımcıları
        └── timeUtils.js        # Zaman hesaplama fonksiyonları
```

## 🛠️ Kullanılan Teknolojiler

### Ana Framework ve Kütüphaneler
- **React Native** (0.81.5) - Mobil uygulama geliştirme framework'ü
- **Expo** (~54.0.25) - React Native geliştirme platformu
- **React** (19.1.0) - UI kütüphanesi

### Navigasyon
- **@react-navigation/native** (^7.1.22) - Navigasyon çözümü
- **@react-navigation/stack** (^7.6.8) - Stack navigator
- **@react-navigation/bottom-tabs** (^7.8.8) - Tab navigator

### State Yönetimi ve Veri Saklama
- **React Context API** - Global state yönetimi
- **@react-native-async-storage/async-storage** (2.2.0) - Yerel veri saklama

### UI ve Görselleştirme
- **react-native-chart-kit** (^6.12.0) - Grafik ve chart'lar
- **react-native-svg** (15.12.1) - SVG desteği
- **expo-linear-gradient** (~15.0.7) - Gradient efektleri
- **react-native-confetti-cannon** (^1.5.2) - Konfeti animasyonları

### Expo Modülleri
- **expo-notifications** (~0.32.14) - Push notification yönetimi
- **expo-haptics** (~15.0.7) - Titreşim geri bildirimleri
- **expo-keep-awake** (~15.0.7) - Ekranı açık tutma
- **expo-device** (~8.0.10) - Cihaz bilgileri
- **expo-constants** (~18.0.11) - Uygulama sabitleri
- **expo-status-bar** (~3.0.8) - Status bar yönetimi

### Gesture ve Ekran Yönetimi
- **react-native-gesture-handler** (~2.28.0) - Gesture yönetimi
- **react-native-safe-area-context** (~5.6.0) - Safe area yönetimi
- **react-native-screens** (~4.16.0) - Native ekran optimizasyonu

## 🎮 Kullanım

### İlk Kullanım

1. **Onboarding**: Uygulama ilk açıldığında tanıtım ekranları gösterilir
2. **Giriş**: Telefon numaranızla giriş yapın
3. **OTP Doğrulama**: SMS ile gelen kodu girin
4. **Ana Ekran**: Pomodoro zamanlayıcı ekranına yönlendirilirsiniz

### Pomodoro Başlatma

1. **Zamanlayıcı** sekmesine gidin
2. **Başlat** butonuna tıklayın
3. Odaklanarak çalışın!
4. Süre bittiğinde bildirim alacaksınız
5. Mola süresinde dinlenin

### Raporları Görüntüleme

1. **Raporlar** sekmesine gidin
2. Günlük, haftalık veya aylık görünümü seçin
3. İstatistiklerinizi ve grafiklerinizi inceleyin
4. Kazandığınız rozetleri görüntüleyin

### Petinizle Etkileşim

1. **Pet** sekmesine gidin
2. Petinizin durumunu kontrol edin
3. Çalışarak puan kazanın
4. Petinizi besleyin ve mutlu edin

### Ayarları Özelleştirme

1. **Ayarlar** sekmesine gidin
2. Tema, süre ayarları ve bildirimleri özelleştirin
3. Değişiklikler otomatik olarak kaydedilir

## 🔧 Geliştirme

### Debug Modu

```bash
npm start
```

Expo Developer Tools açıldığında **Debug mode** aktif olacaktır. Chrome DevTools ile debug edebilirsiniz.

### Temizleme

Cache sorunları yaşıyorsanız:

```bash
expo start -c
```

veya:

```bash
npm start -- --clear
```

### Build Alma

#### Android APK

```bash
expo build:android
```

#### iOS IPA

```bash
expo build:ios
```



## 📝 Lisans

Bu proje özel bir proje olup, tüm hakları saklıdır.

## 👨‍💻 Geliştirici

**Nihat Kadirli**

## 🤝 Katkıda Bulunma

Bu proje şu anda aktif geliştirme aşamasındadır. Katkıda bulunmak isterseniz lütfen iletişime geçin.

## 📞 İletişim

Sorularınız veya önerileriniz için lütfen bir issue açın.

---

**Not**: Bu uygulama Expo ile geliştirilmiştir ve Expo Go uygulaması ile test edilebilir. Production build almak için Expo'nun EAS Build servisi kullanılabilir.



## 🐛 Bilinen Sorunlar

Şu anda bilinen kritik bir sorun bulunmamaktadır. Bir sorunla karşılaşırsanız lütfen issue açın.

## 🔄 Güncelleme Geçmişi

### v1.0.0 (Mevcut)
- ✅ Pomodoro zamanlayıcı
- ✅ Raporlar ve istatistikler
- ✅ Rozet sistemi
- ✅ Sanal evcil hayvan
- ✅ Tema desteği
- ✅ Push notification
- ✅ Onboarding ve OTP girişi

---

**Keyifli çalışmalar! 🍅**
