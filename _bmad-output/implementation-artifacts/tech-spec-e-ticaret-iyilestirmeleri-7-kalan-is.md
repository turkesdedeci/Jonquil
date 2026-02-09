---
title: 'E-Ticaret Iyilestirmeleri (7 Kalan Is)'
slug: 'e-ticaret-iyilestirmeleri-7-kalan-is'
created: '2026-02-09'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js (App Router)', 'React', 'TypeScript', 'Supabase', 'framer-motion']
files_to_modify: [
  'app/urun/[id]/page.tsx',
  'components/SearchModal.tsx',
  'app/(static)/siparis-takip/page.tsx',
  'app/(static)/iletisim/page.tsx',
  'components/ContactForm.tsx',
  'app/admin/AdminClient.tsx',
  'app/api/admin/products/route.ts',
  'app/api/admin/products/manage/route.ts',
  'app/api/admin/setup-stock-table/route.ts',
  'app/api/admin/setup-products-table/route.ts',
  'app/api/orders/route.ts',
  'app/api/orders/track/route.ts',
  'app/api/products/route.ts',
  'hooks/useProducts.tsx',
  'lib/products-server.ts',
  'data/products.ts',
  'app/kategori/[slug]/page.tsx',
  'app/koleksiyon/[slug]/page.tsx',
  'app/layout.tsx'
]
code_patterns: [
  'Server-side related products in app/urun/[id]/page.tsx (similarity scoring + JSON-LD)',
  'Search modal typo tolerance in components/SearchModal.tsx (client-side filter + Levenshtein)',
  'Admin product management and stock toggle in app/admin/AdminClient.tsx',
  'Products API composes db + static products in app/api/products/route.ts',
  'Server-side product aggregation in lib/products-server.ts',
  'Metadata generation via generateMetadata in product/category/collection pages'
]
test_patterns: ['No explicit test framework detected; rely on manual checks and targeted logging/perf timings where needed']
---

# Tech-Spec: E-Ticaret Iyilestirmeleri (7 Kalan Is)

**Created:** 2026-02-09

## Overview

### Problem Statement

Benzer urun onerisi kalitesi, arama typo toleransi performansi, siparis takip dogrulama metni ve destek akisi, admin dusuk stok esigi ve stok miktari yonetimi, hata bildiriminde otomatik konu secimi, SEO/OG metadata otomasyonu ve guest siparislerinin admin panelinde etiketlenmesi/filtrelenmesi net ve tutarli bir sekilde uygulanmamis durumda.

### Solution

Ilgili modullerde hedefli degisikliklerle: benzer urun skorlamasi yeniden ayarlanacak ve stokta olmayanlar dislanacak; arama typo toleransi icin performans olcumu ve gerekirse optimizasyonlar yapilacak; siparis takip sayfasinda dogrulama metni eklenecek ve hata durumunda iletisim sayfasina yonlendirme saglanacak; admin panelinde urun bazli dusuk stok esigi ve stok miktari alanlari eklenecek ve tum urunler duzenlenebilir olacak; /iletisim?type=bug ile konu otomatik secilecek; urun/kategori/koleksiyon ve genel sayfalarda SEO/OG metadata otomasyonu tamamlanacak; guest siparisleri admin listesinde etiketlenecek ve filtrelenebilecek.

### Scope

**In Scope:**
- Benzer urun skor algoritmasi ve stok disindakilerin tamamen dislanmasi
- Arama typo toleransi performans testi (varsayim: 50k urun, hedef <100ms) ve gerekirse optimizasyon
- Siparis takip sayfasina dogrulama metni + hata durumunda iletisim sayfasina yonlendirme
- Admin panelinde urun bazli stock_quantity ve low_stock_threshold (varsayilan 5) alanlari ve duzenleme (tum urunler)
- /iletisim?type=bug ile otomatik konu secimi
- SEO/OG metadata otomasyonu (mevcut urun gorselleriyle; image fallback standardize)
- Guest siparislerinin admin panelinde etiketlenmesi ve filtrelenmesi

**Out of Scope:**
- Yeni tasarim sistemi veya buyuk UI redesign
- Yeni test altyapisi kurmak (mevcut olmayan bir test frameworku eklemek)
- Harici arama servisi entegrasyonu

## Context for Development

### Codebase Patterns

- Benzer urun listesi server-side uretiliyor: `app/urun/[id]/page.tsx`
- Arama typo toleransi `components/SearchModal.tsx` icinde Levenshtein tabanli ve tamamen client-side
- Admin urun/stok yonetimi `app/admin/AdminClient.tsx` ve ilgili API rotalari uzerinden
- Public products listesi `app/api/products/route.ts` ile db + static birlesimi
- Server-side data `lib/products-server.ts` uzerinden birlesiyor (static + db)
- Metadata `generateMetadata` fonksiyonlariyla uretiliyor (urun/kategori/koleksiyon)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| app/urun/[id]/page.tsx | Benzer urun skoru ve metadata |
| components/SearchModal.tsx | Arama + typo toleransi |
| app/(static)/siparis-takip/page.tsx | Siparis takip UI ve metinler |
| app/(static)/iletisim/page.tsx | Iletisim sayfasi girisleri |
| components/ContactForm.tsx | Iletisim formu konu secimi |
| app/admin/AdminClient.tsx | Admin urun/stok/siparis ekranlari |
| app/api/admin/products/route.ts | Stok durumu API |
| app/api/admin/products/manage/route.ts | Urun CRUD (DB urunleri) |
| app/api/admin/setup-stock-table/route.ts | Stock tablo olusturma |
| app/api/admin/setup-products-table/route.ts | Products tablosu schema referansi |
| app/api/orders/route.ts | Siparis olusturma / guest kaynaklari |
| app/api/orders/track/route.ts | Siparis takip API (hata metni) |
| app/api/products/route.ts | Public urun listeleme (db+static) |
| hooks/useProducts.tsx | Search data kaynagi |
| lib/products-server.ts | Server-side urun birlesimi |
| data/products.ts | Static urunler (string ID) |
| app/kategori/[slug]/page.tsx | Kategori metadata |
| app/koleksiyon/[slug]/page.tsx | Koleksiyon metadata |
| app/layout.tsx | Site genel metadata |

### Technical Decisions

- Benzer urunlerde stokta olmayanlar tamamen dislanacak.
- Arama performans hedefi: 50k urun varsayimi, <100ms hedef. Gerektiginde indeksleme / token cache optimizasyonu yapilacak.
- Stock tablosuna `stock_quantity` ve `low_stock_threshold` eklenecek (varsayilan esik 5).
- Guest siparis tespiti `orders.user_id` eksik/null ise guest kabul edilecek.
- OG gorsel olarak mevcut urun gorselleri kullanilacak (ek dinamik OG route yok).
- Tum urunler duzenlenebilir hedefi icin kademeli plan:
  - Asama 1: `product_overrides` tablosu (product_id TEXT) ile static urun override
  - Asama 2: products tablosunda string ID destegi
  - Asama 3: full DB migration (static -> db)

### Implementation Prioritization (Meta)

- Katman A (Kisa kazanımlar): (5) /iletisim?type=bug otomatik konu, (3) siparis takip dogrulama metni + hata yonlendirme
- Katman B (Sistem dokunuslari): (1) benzer urun skoru + stok disi filtre, (2) arama typo performans olcumu + optimizasyon
- Katman C (Veri/altyapi): (4) admin dusuk stok esigi + stock_quantity, (7) guest siparis etiket+filtre, (6) SEO/OG otomasyonu

### Dependencies / Preconditions

- `product_overrides` tablosu kurulmadan “tum urunler duzenlenebilir” hedefi tamam sayilmaz.
- `product_stock` schema degisikligi tamamlanmadan dusuk stok esigi UI aktif edilmemeli.
 - Override + DB urunlerinde cakis varsa oncekik kaynagin (override) baskin olacagi netlestirilecek.

## Implementation Plan

### Tasks

- [ ] Task 1: Stock schema genisletmesi (quantity + threshold) ve override tablosu tasarimi
  - File: `app/api/admin/setup-stock-table/route.ts`
  - Action: `product_stock` SQL'ine `stock_quantity` (INTEGER) ve `low_stock_threshold` (INTEGER default 5) alanlarini ekle, RLS/policy metinlerini guncelle
  - Notes: Varsa mevcut tablo icin ALTER TABLE SQL ipucu da saglanmali
- [ ] Task 2: Override modeli icin yeni admin API
  - File: `app/api/admin/products/route.ts`
  - Action: GET cevabina stock_quantity + low_stock_threshold dahil et (product_stock select genislet)
  - Notes: stock table yoksa default davranis korunur
- [ ] Task 3: Product override CRUD (static urunler icin)
  - File: `app/api/admin/products/manage/route.ts`
  - Action: `product_overrides` tablosu icin GET/POST/PATCH/DELETE akisi ekle (product_id TEXT ile upsert)
  - Notes: DB urunlerinde mevcut akisi bozmadan static override destekle
- [ ] Task 4: Admin panelinde tum urunleri duzenleme + stok alanlari
  - File: `app/admin/AdminClient.tsx`
  - Action: static urunler icin edit modali aktif et, `stock_quantity` ve `low_stock_threshold` alanlarini ekle, kaydetme akisini override tablosuna bagla
  - Notes: override varsa onu goster, yoksa static degerleri defaultla; override DB urunlerini ezebilir
- [ ] Task 5: Benzer urun skoru ayari + stok disi filtre
  - File: `app/urun/[id]/page.tsx`
  - Action: skor hesaplamasini (collection/type/color/family/material) ile guncelle, `inStock !== false` olmayanlari disla
  - Notes: pool azsa fallback logic stokta olanlardan gelsin
- [ ] Task 6: Arama typo toleransi performans olcumu + optimizasyon
  - File: `components/SearchModal.tsx`
  - Action: `performance.now()` ile arama suresi olc, gerekirse token cache/once normalize edilmis index ekle
  - Notes: 50k urun varsayimiyla hedef <100ms
- [ ] Task 7: Siparis takip dogrulama metni ve hata yonlendirme
  - File: `app/(static)/siparis-takip/page.tsx`
  - Action: form ustune dogrulama metni ekle; hata olursa /iletisim?type=bug veya destek param ile yonlendirme
  - Notes: mevcut hata mesaji korunabilir, ek yonlendirme UI'si ekle
- [ ] Task 8: /iletisim?type=bug otomatik konu secimi
  - File: `components/ContactForm.tsx`
  - Action: URL query param `type=bug` gelirse subject defaultunu "Hata Bildirimi" olarak ayarla
  - Notes: gerekirse yeni option ekle
- [ ] Task 9: Guest siparis etiket+filtre
  - File: `app/admin/AdminClient.tsx`
  - Action: guest/registered filter ekle; `user_id` null ise "Misafir" etiketi goster
  - Notes: CSV export da guest etiketi eklenebilir
- [ ] Task 10: SEO/OG otomasyonu standardizasyon
  - File: `app/urun/[id]/page.tsx`, `app/kategori/[slug]/page.tsx`, `app/koleksiyon/[slug]/page.tsx`, `app/layout.tsx`
  - Action: OG image fallback kurali standardize et, eksiklerde `/images/og-default.jpg` kullan
  - Notes: twitter card image ile uyumlu tut

### Acceptance Criteria

- [ ] AC 1: Given bir urun sayfasi stokta olmayan urunle acildiginda, when related products hesaplanir, then listede stokta olmayan urunler gosterilmez.
- [ ] AC 2: Given arama modali acik, when 50k urun datasinda 10 farkli sorgu calistirilir, then ortalama arama suresi <100ms olarak raporlanir.
- [ ] AC 3: Given siparis takip formu, when dogrulama hatasi olusur, then kullanici destek icin /iletisim sayfasina yonlendiren net bir CTA gorur.
- [ ] AC 4: Given admin panel urunler sekmesi, when static bir urun secilip duzenlenir, then degisiklikler `product_overrides` uzerinden kaydedilir ve UI'da gorunur.
- [ ] AC 5: Given admin urun formu, when stok miktari ve dusuk stok esigi girilir, then API stock tablosunda bu alanlar saklanir ve tekrar yuklendiginde gorunur.
- [ ] AC 6: Given /iletisim?type=bug, when form yuklenir, then konu otomatik "Hata Bildirimi" olarak secilir.
- [ ] AC 7: Given admin siparis listesi, when guest filtresi secilir, then sadece `user_id` null olan siparisler listelenir.
- [ ] AC 8: Given urun/kategori/koleksiyon sayfasi metadata uretir, when og image yoksa, then `/images/og-default.jpg` kullanilir.

## Additional Context

### Dependencies

- Supabase `product_stock` tablosu schema guncellemesi
- Yeni `product_overrides` tablosu (product_id TEXT, editable fields)

### Testing Strategy

- Manuel test senaryolari ve hedef performans olcumu (SearchModal; perf timing)
- Admin urun duzenleme (static + db) ve guest filtre testleri
- Siparis takip hata akisi + iletisim sayfasi otomatik konu testi

### Notes

- Admin'de tum urunler duzenlenebilir olmali (liste/paginasyon sinirlamasi varsa kaldirilacak)
- Override + DB urunlerinde cakis durumunda override baskin kabul edilecek
