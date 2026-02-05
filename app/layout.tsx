import type { Metadata } from "next";
import { ClerkWrapper } from '@/components/ClerkWrapper';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import "./globals.css";

export const metadata: Metadata = {
  title: "JONQUIL STUDIO - Premium El Yapımı Porselen",
  description: "Premium el yapımı porselen tabak setleri ve tasarım objeleri ile sofranıza zarafet katın.",
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
          <CartProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </CartProvider>
        </ClerkWrapper>
      </body>
    </html>
  );
}