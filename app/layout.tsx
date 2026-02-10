import type { Metadata } from "next";
import { ClerkWrapper } from '@/components/ClerkWrapper';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { StockProvider } from '@/contexts/StockContext';
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext';
import { ProductsProvider } from '@/hooks/useProducts';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.jonquilstudio.co'),
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
  authors: [{ name: 'Jonquil Studio' }],
  creator: 'Jonquil Studio',
  publisher: 'Jonquil Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://www.jonquilstudio.co',
    siteName: 'Jonquil Studio',
    title: 'Jonquil Studio - El Yapımı Türk Porseleni',
    description: 'Premium el yapımı porselen tabak setleri ve tasarım objeleri.',
    images: [
      {
        url: '/images/products/GENEL FOTOLAR/Header-1.jpg',
        alt: 'Jonquil Studio - El Yapımı Türk Porseleni',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jonquil Studio - El Yapımı Türk Porseleni',
    description: 'Premium el yapımı porselen tabak setleri ve tasarım objeleri.',
    images: ['/images/products/GENEL FOTOLAR/Header-1.jpg'],
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
