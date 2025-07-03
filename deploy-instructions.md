# Supabase Edge Function Manuel Deploy Rehberi

## 1. Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Projenizi seçin: `mkicyvhybhfhvbdgjhov`

## 2. Edge Functions Bölümüne Git

1. Sol menüden **"Edge Functions"** sekmesine tıklayın
2. Eğer `license-api` function'ı varsa, üzerine tıklayın
3. Yoksa **"Create a new function"** butonuna tıklayın

## 3. Function Oluştur/Güncelle

1. **Function Name:** `license-api`
2. Açılan editörde mevcut kodu silin
3. `supabase/functions/license-api/index.ts` dosyasındaki GÜNCEL kodu yapıştırın

## 4. Deploy Et

1. **Deploy** butonuna tıklayın
2. Deploy işleminin tamamlanmasını bekleyin (yeşil checkmark görünene kadar)

## 5. Test Et

Deploy işlemi tamamlandıktan sonra:

### Test Endpoint (Authorization gerektirmez):
```
GET https://mkicyvhybhfhvbdgjhov.supabase.co/functions/v1/license-api/test
```

### Client Endpoint (Authorization gerektirir):
```
POST https://mkicyvhybhfhvbdgjhov.supabase.co/functions/v1/license-api/client

Headers:
Authorization: demo-api-key-12345

Body:
{
  "licensekey": "DEMO-12345-ABCDE-67890",
  "product": "Demo Product", 
  "version": "1.0.0"
}
```

## 6. API Docs Sayfasında Test

1. Uygulamada API Docs sayfasına gidin
2. "API Test Et" butonuna tıklayın
3. "Client Test" butonuna tıklayın
4. Her iki test de başarılı olmalı

## Önemli Değişiklikler

- Authorization header kontrolü düzeltildi
- Bearer token formatı desteklendi
- Demo lisans sistemi eklendi
- Hata mesajları iyileştirildi
- CORS ayarları güncellendi

## Demo Test Verileri

- **License Key:** DEMO-12345-ABCDE-67890
- **Product:** Demo Product
- **Version:** 1.0.0
- **API Key:** Herhangi bir değer (örn: demo-api-key-12345)

## Sorun Giderme

Eğer hala hata alıyorsanız:

1. Function'ın tamamen deploy edildiğinden emin olun
2. Birkaç dakika bekleyin (cold start)
3. Browser cache'ini temizleyin
4. Supabase Dashboard > Edge Functions > license-api > Logs bölümünü kontrol edin