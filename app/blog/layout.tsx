import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { absoluteUrl } from '@/lib/site';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Jonquil Studio Blog RSS"
          href={absoluteUrl('/blog/rss.xml')}
        />
      </head>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
