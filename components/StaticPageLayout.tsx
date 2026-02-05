'use client';

import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface StaticPageLayoutProps {
  children: React.ReactNode;
}

export default function StaticPageLayout({ children }: StaticPageLayoutProps) {
  const router = useRouter();

  // Navigation handler for hash-based routes
  const handleNavigation = (route: { name: string; slug?: string }) => {
    switch (route.name) {
      case 'home':
        router.push('/');
        break;
      case 'urunler':
        router.push('/#/urunler');
        break;
      case 'collection':
        router.push(`/#/koleksiyon/${route.slug}`);
        break;
      case 'collections':
        router.push('/#/koleksiyonlar');
        break;
      case 'about':
        router.push('/hakkimizda');
        break;
      case 'contact':
        router.push('/iletisim');
        break;
      case 'hesabim':
        router.push('/hesabim');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar go={handleNavigation} />
      {children}
      <Footer onGo={handleNavigation} />
    </div>
  );
}
