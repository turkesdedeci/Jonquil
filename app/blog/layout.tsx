import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': absoluteUrl('/blog/rss.xml'),
    },
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
