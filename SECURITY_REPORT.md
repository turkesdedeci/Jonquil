# Güvenlik Raporu (2026-02-10)

## Kapsam
- Kod tabanı güvenlik incelemesi
- API route sertleştirme
- CSP/header sıkılaştırma
- Ödeme akışı izolasyonu (iyzico)

## Özet
Kritik açık kalmadı. Ana riskler giderildi: rate limit, admin koruması, debug endpoint’ler, CSP/XSS yüzeyi ve ödeme akışı izolasyonu.

## Uygulanan Başlıca Değişiklikler
1. **Rate limit zorunlu hale getirildi** (public, auth ve admin endpoint’leri; Redis uyumlu).
2. **Admin erişim kontrolleri** doğrulandı ve eksik yerlere eklendi.
3. **Debug endpoint/sayfaları** prod’da kapatıldı.
4. **CSRF azaltımı** için hassas endpoint’lerde same‑origin kontrolü eklendi.
5. **Iyzico checkout** sandboxed iframe içine alındı.
6. **CSP sertleştirildi** (istek başına nonce + raporlama).
7. **CSP rapor endpoint’i** eklendi ve kötüye kullanıma karşı sertleştirildi.
8. **Güvenlik header’ları** tüm yanıtlarda garanti altına alındı.

## Kalan Artık Riskler
1. **Nonce tabanlı CSP, header taşınmasına bağlı**  
   - Reverse proxy `x-nonce` header’ını düşürürse inline JSON‑LD script’ler engellenebilir.
2. **Hosted checkout aktif değil**  
   - Iyzico hâlâ gömülü HTML kullanıyor. Hosted checkout XSS yüzeyini daha da azaltır.
3. **Otomatik dış test**  
   - Bot koruması canlı doğrulamayı engelledi. Manuel doğrulama önerilir.

## Önerilen Sonraki Adımlar (Opsiyonel)
1. Mümkünse **iyzico hosted checkout**’a geçiş.
2. CSP raporları için **kalıcı log saklama** (Supabase tablosu).
3. Prod trafikte CSP doğrulaması yapıp izin verilen kaynakları netleştirme.

## CSP Rapor Tablosu (Supabase SQL)
```sql
CREATE TABLE IF NOT EXISTS csp_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip TEXT,
  report TEXT
);

ALTER TABLE csp_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role all" ON csp_reports
  FOR ALL USING (auth.role() = 'service_role');
```

## Doğrulama Notları
Bu oturumda test çalıştırılmadı. Dağıtım sonrası standart build/test hattı önerilir.
