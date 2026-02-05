import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { trTR } from '@clerk/localizations';
import { CartProvider } from '@/contexts/CartContext';
import { SafeUserProvider } from '@/contexts/ClerkContext';
import "./globals.css";

export const metadata: Metadata = {
  title: "JONQUIL STUDIO - Premium El Yapımı Porselen",
  description: "Premium el yapımı porselen tabak setleri ve tasarım objeleri ile sofranıza zarafet katın.",
};

// Check if Clerk is configured
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <CartProvider>
      <SafeUserProvider>
        <html lang="tr">
          <body className="antialiased font-sans">
            {children}
          </body>
        </html>
      </SafeUserProvider>
    </CartProvider>
  );

  if (!hasClerkKey) {
    return content;
  }

  return (
    <ClerkProvider localization={trTR}>
      {content}
    </ClerkProvider>
  );
}