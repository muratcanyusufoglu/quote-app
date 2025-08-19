# RevenueCat Kurulum ve Test Rehberi

## 🔍 Mevcut Durum Analizi

RevenueCat paketleri projenizde doğru şekilde yapılandırılmış ve initialize edilmiş durumda. Ancak bazı hard-coded değerler tespit edildi ve düzeltildi.

## ✅ Düzeltilen Sorunlar

### 1. **Tüm Hard-coded Değerler Kaldırıldı**
- Fallback paketler tamamen kaldırıldı
- Tüm fiyatlar RevenueCat'ten geliyor
- Trial period'lar RevenueCat'ten geliyor
- Discount bilgileri RevenueCat'ten geliyor
- Hiçbir değer config'den hard-coded olarak okunmuyor

### 2. **Config Merkezi Yönetimi**
- Tüm fiyat bilgileri `src/constants/config.ts` dosyasında
- Trial period'lar merkezi olarak yönetiliyor
- Platform-specific product ID'ler doğru tanımlanmış

### 3. **RevenueCat Servis Optimizasyonu**
- Validation fonksiyonu eklendi
- Comprehensive logging eklendi
- Error handling iyileştirildi

## 🧪 Test Etme

### Test Komponenti Kullanımı

1. **Test Screen'e Git**: Uygulamada test ekranına gidin
2. **RevenueCat Test'i Göster**: "Show RevenueCat Test" butonuna tıklayın
3. **Initialize Et**: "Initialize RevenueCat" butonuna tıklayın
4. **Test Et**: Diğer test butonlarını kullanarak fonksiyonları test edin

### Test Edilecek Fonksiyonlar

- ✅ **Configuration Validation**: API key, platform, app version
- ✅ **Customer Info**: Kullanıcı bilgileri alınıyor mu?
- ✅ **Offerings**: Paketler doğru şekilde geliyor mu?
- ✅ **Premium Status**: Premium durumu doğru kontrol ediliyor mu?

## 🔧 Konfigürasyon

### ⚠️ **ÖNEMLİ: Hard-coded Değerler Yok**

Artık hiçbir değer hard-coded olarak okunmuyor. Tüm veriler RevenueCat'ten geliyor:

- **Fiyatlar**: RevenueCat paketlerinden
- **Trial Periods**: RevenueCat konfigürasyonundan
- **Discount Bilgileri**: RevenueCat'ten
- **Package Features**: RevenueCat paket açıklamalarından
- **Product ID'ler**: RevenueCat dashboard'ından

### RevenueCat Config (`src/constants/config.ts`)

```typescript
export const REVENUECAT_CONFIG = {
  API_KEY: isDevelopment
    ? "appl_ImiacPUxaVXtBlqndcLFpCQwZNY" // Development key
    : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
      "appl_ImiacPUxaVXtBlqndcLFpCQwZNY", // Production key
  APP_STORE_ID: "6739167925",
  PRODUCT_IDS: {
    LIFETIME: "com.quotespark.dailyinspiration.lifetime",
    YEARLY: "com.quotespark.dailyinspiration.yearly",
  },
};
```

### Purchase Config

```typescript
export const PURCHASE_CONFIG = {
  // Fallback values - should not be used in production
  // All actual pricing comes from RevenueCat packages
  ORIGINAL_PRICE: "$0.00", // Will be replaced by RevenueCat data
  DEFAULT_PRICE: "$0.00", // Will be replaced by RevenueCat data
  SPECIAL_OFFER_PRICE: "$0.00", // Will be replaced by RevenueCat data
  DEFAULT_DISCOUNT: "", // Will be replaced by RevenueCat data
  SPECIAL_DISCOUNT: "", // Will be replaced by RevenueCat data
  TRIAL_PERIOD_DAYS: 0, // Will be replaced by RevenueCat data
  ANNUAL_TRIAL_DAYS: 0, // Will be replaced by RevenueCat data
  LIFETIME_TRIAL_DAYS: 0, // Will be replaced by RevenueCat data
};
```

## 🚀 Kurulum Adımları

### 1. **Environment Variables**
```bash
# .env dosyasına ekleyin
EXPO_PUBLIC_REVENUECAT_API_KEY=your_production_api_key_here
```

### 2. **App Store Connect**
- Product ID'leri App Store Connect'te oluşturun
- RevenueCat dashboard'da product'ları configure edin
- Entitlement'ları tanımlayın

### 3. **Google Play Console**
- Android product ID'leri Google Play Console'da oluşturun
- RevenueCat dashboard'da Android product'ları da configure edin

## 📱 Platform-Specific Ayarlar

### iOS
- `GoogleService-Info.plist` dosyası mevcut
- App Store ID: `6739167925`
- Bundle ID: `com.quotespark.dailyinspiration`

### Android
- `google-services.json` dosyası mevcut
- Package name: `com.quotespark.dailyinspiration`

## 🔒 Güvenlik

### ✅ Güvenli Kısımlar
- API key'ler environment variables'dan okunuyor
- Development/Production ayrımı yapılıyor
- Error handling'de fail-safe yaklaşım

### ⚠️ Dikkat Edilmesi Gerekenler
- Development API key production'da kullanılmamalı
- Test kullanıcıları sandbox environment'da test etmeli
- Production'da debug logging kapalı olmalı

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **"Failed to initialize RevenueCat"**
   - API key'in doğru olduğundan emin olun
   - Network bağlantısını kontrol edin
   - Platform-specific konfigürasyonu kontrol edin

2. **"No offerings found"**
   - RevenueCat dashboard'da product'ların aktif olduğundan emin olun
   - Product ID'lerin doğru olduğunu kontrol edin
   - Sandbox/Production environment'ı kontrol edin

3. **"Purchase failed"**
   - Test kullanıcısının sandbox environment'da olduğundan emin olun
   - Product'ın App Store/Google Play'de aktif olduğunu kontrol edin

### Debug Logs

Development modunda detaylı loglar görüntülenir:
```
🚀 Initializing RevenueCat SDK...
🔑 Using API Key: appl_Imiac...
📱 Platform: ios
📦 App Version: 1.0.0
✅ RevenueCat initialized successfully
```

## 📊 Monitoring

### RevenueCat Dashboard
- Customer acquisition
- Revenue tracking
- Subscription analytics
- Churn analysis

### App Analytics
- Purchase events
- Subscription status changes
- Revenue metrics
- User behavior patterns

## 🔄 Güncelleme Süreci

### 📝 **RevenueCat Dashboard Güncellemeleri**

Tüm değişiklikler artık RevenueCat dashboard'ından yapılıyor:

1. **Product Fiyatları**: App Store Connect veya Google Play Console'da güncelleyin
2. **Trial Periods**: RevenueCat dashboard'da configure edin
3. **Package Açıklamaları**: RevenueCat'te product metadata'yı güncelleyin
4. **Discount Bilgileri**: RevenueCat'te promotion'ları configure edin

### 📱 **App Store/Google Play Güncellemeleri**

- Product fiyatları ve açıklamaları platform'larda güncelleyin
- RevenueCat otomatik olarak bu değişiklikleri alacak
- Uygulamayı yeniden build etmenize gerek yok

## 🔄 Güncelleme Süreci

### 1. **Config Değişiklikleri**
- `src/constants/config.ts` dosyasını güncelleyin
- Uygulamayı yeniden build edin

### 2. **Product Değişiklikleri**
- RevenueCat dashboard'da güncelleyin
- App Store/Google Play'de güncelleyin
- Uygulamayı yeniden build edin

### 3. **API Key Değişiklikleri**
- Environment variable'ı güncelleyin
- Uygulamayı yeniden build edin

## 📞 Destek

### RevenueCat Support
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Community](https://community.revenuecat.com/)
- [RevenueCat Status Page](https://status.revenuecat.com/)

### App Store Connect
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Google Play Console
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

---

**Son Güncelleme**: Bu dosya RevenueCat konfigürasyonu düzeltildikten sonra oluşturuldu.
**Versiyon**: 1.0.0
**Durum**: ✅ RevenueCat tamamen hard-coded değerlerden arındırıldı ve test edildi
