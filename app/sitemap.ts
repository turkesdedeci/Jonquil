import type { MetadataRoute } from 'next';
import { getAllProductsServer } from '@/lib/products-server';
import { absoluteUrl, getSiteUrl } from '@/lib/site';

export const revalidate = 3600;

const categorySlugs = [
  'tabaklar',
  'fincanlar',
  'kullukler',
  'mumluklar',
  'aksesuarlar',
  'tekstil',
  'tepsiler',
];

const collectionSlugs = ['aslan', 'ottoman'];

const staticRoutes = [
  '/',
  '/urunler',
  '/blog',
  '/hakkimizda',
  '/iletisim',
  '/gizlilik-politikasi',
  '/gizlilik-guvenlik-politikasi',
  '/kisisel-veriler-politikasi',
  '/mesafeli-satis-sozlesmesi',
  '/on-bilgilendirme-formu',
  '/iptal-iade-proseduru',
  '/teslimat-iade',
  '/uyelik-sozlesmesi',
  '/siparis-takip',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const siteUrl = getSiteUrl();

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map((path) => ({
      url: new URL(path, siteUrl).toString(),
      lastModified: now,
      changeFrequency: path === '/' ? ('daily' as const) : ('weekly' as const),
      priority: path === '/' ? 1 : 0.8,
    })),
    ...categorySlugs.map((slug) => ({
      url: absoluteUrl(`/kategori/${slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...collectionSlugs.map((slug) => ({
      url: absoluteUrl(`/koleksiyon/${slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  const products = await getAllProductsServer();
  const productEntries = products.map((product) => ({
    url: absoluteUrl(`/urun/${product.id}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...entries, ...productEntries]) {
    deduped.set(entry.url, entry);
  }

  return Array.from(deduped.values());
}

