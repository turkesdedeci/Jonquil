'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'bug') {
      setSubject('Hata Bildirimi');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        // Reset form
        (e.target as HTMLFormElement).reset();
        setSubject(searchParams.get('type') === 'bug' ? 'Hata Bildirimi' : '');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Bir hata oluştu');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 text-lg font-semibold text-green-900">Mesajınız Gönderildi!</h3>
        <p className="mb-4 text-green-700">
          En kısa sürede sizinle iletişime geçeceğiz.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-sm font-medium text-green-700 underline hover:text-green-800"
        >
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#e8e6e3] bg-white p-6">
      {status === 'error' && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
          <XCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">
            Adınız Soyadınız *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            disabled={status === 'loading'}
            className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44] disabled:bg-neutral-100"
            placeholder="Adınız Soyadınız"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
            E-posta Adresiniz *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={status === 'loading'}
            className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44] disabled:bg-neutral-100"
            placeholder="ornek@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-neutral-700">
          Telefon Numaranız
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          disabled={status === 'loading'}
          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44] disabled:bg-neutral-100"
          placeholder="+90 (5XX) XXX XX XX"
        />
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-neutral-700">
          Konu *
        </label>
        <select
          id="subject"
          name="subject"
          required
          disabled={status === 'loading'}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44] disabled:bg-neutral-100"
        >
          <option value="">Konu seçiniz</option>
          <option value="Sipariş Hakkında">Sipariş Hakkında</option>
          <option value="İade/Değişim">İade/Değişim</option>
          <option value="Ürün Bilgisi">Ürün Bilgisi</option>
          <option value="Öneri/Şikayet">Öneri/Şikayet</option>
          <option value="Hata Bildirimi">Hata Bildirimi</option>
          <option value="Diğer">Diğer</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-neutral-700">
          Mesajınız *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          disabled={status === 'loading'}
          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44] disabled:bg-neutral-100"
          placeholder="Mesajınızı buraya yazın..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f3f44] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0a2a2e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Gönder
          </>
        )}
      </button>
    </form>
  );
}
