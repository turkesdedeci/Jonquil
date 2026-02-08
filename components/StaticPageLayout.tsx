'use client';

import Navbar from './Navbar';
import Footer from './Footer';

interface StaticPageLayoutProps {
  children: React.ReactNode;
}

export default function StaticPageLayout({ children }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
