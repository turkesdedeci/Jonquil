import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { trTR } from '@clerk/localizations';
import { CartProvider } from '@/contexts/CartContext';  // YENİ
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <CartProvider>  {/* YENİ */}
        <html lang="tr">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </CartProvider>  {/* YENİ */}
    </ClerkProvider>
  );
}