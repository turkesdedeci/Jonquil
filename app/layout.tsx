import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { trTR } from '@clerk/localizations';
import { CartProvider } from '@/contexts/CartContext';
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
    <ClerkProvider localization={trTR}>
      <CartProvider>
        <html lang="tr">
          <body className="antialiased font-sans">
            {children}
          </body>
        </html>
      </CartProvider>
    </ClerkProvider>
  );
}