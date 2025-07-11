# 📊 Analytics Kurulum ve Kullanım Rehberi

Bu doküman, uygulamanıza entegre edilen Firebase Analytics'in kurulum ve kullanım sürecini açıklar.

## 🚀 Firebase Kurulumu

### 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Add project" (Proje ekle) butonuna tıklayın
3. Proje adını girin (örn: "quotespark-analytics")
4. Google Analytics'i etkinleştirin
5. Analytics hesabınızı seçin veya yeni bir tane oluşturun

### 2. Uygulama Ekleme

#### iOS Uygulaması:
1. Firebase Console'da iOS simgesine tıklayın
2. Bundle ID: `com.quotespark.dailyinspiration` girin
3. `GoogleService-Info.plist` dosyasını indirin
4. Dosyayı projenizin root klasörüne yerleştirin

#### Android Uygulaması:
1. Firebase Console'da Android simgesine tıklayın
2. Package name: `com.quotespark.dailyinspiration` girin
3. `google-services.json` dosyasını indirin
4. Dosyayı projenizin root klasörüne yerleştirin

### 3. Konfigürasyon Dosyalarını Ekleme

Proje root klasörünüze aşağıdaki dosyaları ekleyin:

```
# iOS için
GoogleService-Info.plist

# Android için  
google-services.json
```

### 4. Uygulamayı Çalıştırma

```bash
# Dependencies'i yeniden yükleyin
npm install

# iOS için clean build
npx expo run:ios --clear

# Android için clean build
npx expo run:android --clear
```

## 📈 Takip Edilen Events

### 🖥️ Screen Events
- **screen_view**: Ekran görüntülemeleri
  - `screen_name`: Ekran adı
  - `screen_class`: Ekran sınıfı

### 📖 Quote Events
- **quote_view**: Quote görüntüleme
- **quote_favorite_add**: Favoriye ekleme
- **quote_favorite_remove**: Favoriden çıkarma
- **quote_share**: Quote paylaşma

### 📂 Category Events
- **category_view**: Kategori görüntüleme
- **category_filter**: Kategori filtreleme

### 👤 User Events
- **user_action**: Kullanıcı aksiyonları
- **theme_change**: Tema değişikliği
- **language_change**: Dil değişikliği

### 🎯 Onboarding Events
- **onboarding_start**: Onboarding başlangıcı
- **onboarding_step**: Adım tamamlama
- **onboarding_complete**: Onboarding tamamlama

### 💳 Purchase Events
- **purchase_start**: Satın alma başlangıcı
- **purchase_complete**: Satın alma tamamlama
- **purchase_failed**: Satın alma hatası

### 🔒 Paywall Events
- **paywall_view**: Paywall görüntüleme
- **paywall_action**: Paywall aksiyonu

### ⚡ Performance Events
- **performance_app_start**: Uygulama başlatma süresi
- **performance_screen_load**: Ekran yükleme süresi

## 📊 Firebase Analytics Dashboard'u Kullanma

### Realtime Veriler
1. Firebase Console > Analytics > Realtime
2. Anlık kullanıcı aktivitelerini görün
3. Event'lerin gerçek zamanlı akışını takip edin

### Event Analytics
1. Firebase Console > Analytics > Events
2. Tüm custom event'lerinizi görün
3. Event parametrelerini analiz edin

### Audience Insights
1. Firebase Console > Analytics > Audiences
2. Kullanıcı davranışlarını segment'lere ayırın
3. Retention analizleri yapın

### Conversion Funnels
1. Firebase Console > Analytics > Analysis > Funnel Analysis
2. Onboarding conversion oranlarını ölçün
3. Purchase funnel'ını analiz edin

## 🎯 Önemli Metrikleri

### 📱 Uygulama Performansı
- **Daily Active Users (DAU)**
- **Session Duration**: Oturum süresi
- **Screen View Count**: Ekran görüntüleme sayıları
- **App Start Performance**: Uygulama başlatma performansı

### 📖 Content Engagement
- **Quote Views**: Quote görüntüleme sayıları
- **Favorite Rate**: Favoriye ekleme oranı
- **Share Rate**: Paylaşma oranı
- **Category Popularity**: Popüler kategoriler

### 💰 Monetization
- **Purchase Conversion Rate**: Satın alma dönüşüm oranı
- **Paywall Show Rate**: Paywall gösterim oranı
- **Premium User Ratio**: Premium kullanıcı oranı

### 🎯 User Journey
- **Onboarding Completion Rate**: Onboarding tamamlama oranı
- **Feature Discovery**: Özellik keşif oranları
- **User Retention**: Kullanıcı tutma oranı

## 🔧 Custom Analytics Kullanımı

### Yeni Event Ekleme

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const { trackCustomEvent } = useAnalytics();

// Custom event tracking
trackCustomEvent('custom_event_name', {
  parameter1: 'value1',
  parameter2: 123,
  parameter3: true
});
```

### User Properties Ayarlama

```typescript
const { setUserProperty, setUserId } = useAnalytics();

// Kullanıcı özelliği ayarlama
setUserProperty('user_type', 'premium');
setUserProperty('preferred_category', 'motivation');

// Kullanıcı ID ayarlama
setUserId('user_12345');
```

## 🚨 Sorun Giderme

### Analytics Çalışmıyor
1. Firebase konfigürasyon dosyalarının doğru konumda olduğunu kontrol edin
2. Bundle ID / Package name'lerin eşleştiğini doğrulayın
3. Internet bağlantısını kontrol edin
4. Debug modda console loglarını inceleyin

### Event'ler Görünmüyor
1. Event'lerin Firebase Console'da görünmesi 24 saat sürebilir
2. Realtime bölümünde anlık verileri kontrol edin
3. Event parametrelerinin doğru formatta olduğunu kontrol edin

### Debug Modu
```typescript
// Analytics'i debug modda çalıştırma
import analyticsService from '../services/AnalyticsService';

// Development'ta verbose logging
if (__DEV__) {
  console.log('Analytics Debug Mode Active');
}
```

## 📋 Checklist

- [ ] Firebase projesi oluşturuldu
- [ ] iOS ve Android uygulamaları eklendi
- [ ] GoogleService-Info.plist eklendi (iOS)
- [ ] google-services.json eklendi (Android)
- [ ] Uygulama clean build ile çalıştırıldı
- [ ] Event'ler Firebase Console'da görüntüleniyor
- [ ] Analytics dashboard'u incelendi
- [ ] Key metrics tanımlandı

## 🎉 Tebrikler!

Analytics kurulumunuz tamamlandı! Artık kullanıcı davranışlarını detaylı şekilde takip edebilir, uygulama performansınızı ölçebilir ve data-driven kararlar alabilirsiniz.

### Faydalı Linkler
- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [React Native Firebase](https://rnfirebase.io/)
- [Analytics Best Practices](https://firebase.google.com/docs/analytics/best-practices) 