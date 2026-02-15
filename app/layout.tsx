import type { Metadata } from "next";
import { ClerkWrapper } from '@/components/ClerkWrapper';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { StockProvider } from '@/contexts/StockContext';
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext';
import { ProductsProvider } from '@/hooks/useProducts';
import { absoluteUrl, getSiteUrl, SITE_NAME } from '@/lib/site';
import CookieConsent from '@/components/CookieConsent';
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Jonquil Studio - El Yapımı Türk Porseleni',
    template: '%s | Jonquil',
  },
  description: 'Premium el yapımı porselen tabak setleri ve tasarım objeleri ile sofranıza zarafet katın. Aslan ve Ottoman koleksiyonları.',
  keywords: [
    'porselen',
    'el yapımı',
    'Türk porseleni',
    'lüks sofra',
    'tabak',
    'fincan',
    'Jonquil',
    'Ottoman',
    'Aslan koleksiyonu',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: siteUrl,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: SITE_NAME,
    title: 'Jonquil Studio - El Yapımı Türk Porseleni',
    description: 'Premium el yapımı porselen tabak setleri ve tasarım objeleri.',
    images: [
      {
        url: absoluteUrl('/images/og-default.jpg'),
        alt: 'Jonquil Studio - El Yapımı Türk Porseleni',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jonquil Studio - El Yapımı Türk Porseleni',
    description: 'Premium el yapımı porselen tabak setleri ve tasarım objeleri.',
    images: [absoluteUrl('/images/og-default.jpg')],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased font-sans">
        <ClerkWrapper>
          <ProductsProvider>
            <CartProvider>
              <FavoritesProvider>
                <StockProvider>
                  <RecentlyViewedProvider>
                    {children}
                    <CookieConsent />
                    <Analytics />
                  </RecentlyViewedProvider>
                </StockProvider>
              </FavoritesProvider>
            </CartProvider>
          </ProductsProvider>
        </ClerkWrapper>
      </body>
    </html>
  );
}
