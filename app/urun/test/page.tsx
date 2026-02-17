import { notFound } from 'next/navigation';

export default function UrunTestPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
      <h1>Urun Test OK</h1>
      <p>If you can see this, /urun/* routes are wired correctly.</p>
    </div>
  );
}
