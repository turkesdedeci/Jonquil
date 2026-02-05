import { ClerkProvider } from '@clerk/nextjs';
import { trTR } from '@clerk/localizations';
import './globals.css';

export const metadata = {
  title: 'JONQUIL STUDIO - Premium El Yapımı Porselen',
  description: 'Premium el yapımı porselen tabak setleri ve tasarım objeleri ile sofranıza zarafet katın.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={trTR}>
      <html lang="tr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
