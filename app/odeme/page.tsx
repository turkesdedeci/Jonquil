'use client';

// Force dynamic rendering to prevent build-time prerendering with Clerk
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useClerkUser';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Truck,
  ChevronRight,
  Plus,
  Edit,
  Check
} from 'lucide-react';

interface Address {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  address_line: string;
  district: string;
  city: string;
  postal_code?: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, totalPrice, clearCart } = useCart();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [orderNote, setOrderNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const shippingCost = 50; // Sabit kargo ücreti - dinamik yapılabilir
  const grandTotal = totalPrice + shippingCost;

  // Adresleri yükle
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        
        // Varsayılan adresi seç
        const defaultAddress = data.find((a: Address) => a.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sipariş oluştur
  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      alert('Lütfen bir teslimat adresi seçin');
      return;
    }

    if (items.length === 0) {
      alert('Sepetiniz boş');
      return;
    }

    setSubmitting(true);

    try {
      // Sipariş verilerini hazırla
      const orderData = {
        user_id: user?.id,
        shipping_address_id: selectedAddressId,
        payment_method: paymentMethod,
        order_note: orderNote,
        items: items.map(item => ({
          product_id: item.productId,
          product_title: item.title,
          product_subtitle: item.subtitle,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: parseFloat(item.price.replace(/[^0-9]/g, '')),
          total_price: parseFloat(item.price.replace(/[^0-9]/g, '')) * item.quantity,
        })),
        subtotal: totalPrice,
        shipping_cost: shippingCost,
        total_amount: grandTotal,
      };

      // Sipariş API'sine gönder
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const order = await res.json();
        
        // Sepeti temizle
        clearCart();
        
        // Başarı sayfasına yönlendir
        router.push(`/siparis-basarili?order_id=${order.id}`);
      } else {
        alert('Sipariş oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Sipariş hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-[#666]">Ödeme yapmak için giriş yapmalısınız</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-full bg-[#0f3f44] px-6 py-3 text-white hover:bg-[#0a2a2e]"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-[#e8e6e3]" />
          <p className="mb-4 text-lg text-[#666]">Sepetiniz boş</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-full bg-[#0f3f44] px-6 py-3 text-white hover:bg-[#0a2a2e]"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-light text-[#1a1a1a]">
            Ödeme
          </h1>
          <p className="text-[#666]">Siparişinizi tamamlamak için bilgilerinizi kontrol edin</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sol Taraf - Adres + Ödeme */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teslimat Adresi */}
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3f44]">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1a1a1a]">
                    Teslimat Adresi
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 text-sm font-medium text-[#0f3f44] hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Adres
                </button>
              </div>

              {loading ? (
                <div className="py-8 text-center text-[#666]">Yükleniyor...</div>
              ) : addresses.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-[#e8e6e3] bg-[#faf8f5] p-8 text-center">
                  <p className="mb-4 text-[#666]">Henüz kayıtlı adres yok</p>
                  <button
                    onClick={() => router.push('/hesabim')}
                    className="rounded-full bg-[#0f3f44] px-6 py-2 text-sm text-white hover:bg-[#0a2a2e]"
                  >
                    Adres Ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        selectedAddressId === address.id
                          ? 'border-[#0f3f44] bg-[#0f3f44]/5'
                          : 'border-[#e8e6e3] hover:border-[#0f3f44]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-semibold text-[#1a1a1a]">
                              {address.title}
                            </span>
                            {address.is_default && (
                              <span className="rounded-full bg-[#0f3f44] px-2 py-0.5 text-xs text-white">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#666]">
                            {address.full_name}<br />
                            {address.address_line}<br />
                            {address.district}, {address.city} {address.postal_code}<br />
                            {address.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedAddressId === address.id && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f3f44]">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ödeme Yöntemi */}
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3f44]">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#1a1a1a]">
                  Ödeme Yöntemi
                </h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#0f3f44] bg-[#0f3f44]/5'
                      : 'border-[#e8e6e3] hover:border-[#0f3f44]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1 font-semibold text-[#1a1a1a]">
                        Kredi/Banka Kartı
                      </div>
                      <p className="text-sm text-[#666]">
                        Güvenli ödeme ile anında onay
                      </p>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f3f44]">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-[#0f3f44] bg-[#0f3f44]/5'
                      : 'border-[#e8e6e3] hover:border-[#0f3f44]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1 font-semibold text-[#1a1a1a]">
                        Havale/EFT
                      </div>
                      <p className="text-sm text-[#666]">
                        Banka hesap bilgileri sipariş sonrası gönderilecek
                      </p>
                    </div>
                    {paymentMethod === 'bank' && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f3f44]">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Sipariş Notu */}
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h3 className="mb-4 font-semibold text-[#1a1a1a]">
                Sipariş Notu (Opsiyonel)
              </h3>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Siparişiniz hakkında not eklemek isterseniz buraya yazabilirsiniz..."
                rows={4}
                className="w-full rounded-xl border border-[#e8e6e3] p-4 text-sm focus:border-[#0f3f44] focus:outline-none"
              />
            </div>
          </div>

          {/* Sağ Taraf - Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3f44]">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#1a1a1a]">
                  Sipariş Özeti
                </h2>
              </div>

              {/* Ürünler */}
              <div className="mb-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf8f5]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#1a1a1a]">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#666]">{item.subtitle}</div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-[#666]">{item.quantity} adet</span>
                        <span className="font-semibold text-[#1a1a1a]">
                          {(parseFloat(item.price.replace(/[^0-9]/g, '')) * item.quantity).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e8e6e3] pt-4" />

              {/* Fiyat Özeti */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#666]">Ara Toplam</span>
                  <span className="font-medium text-[#1a1a1a]">
                    {totalPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[#666]">
                    <Truck className="h-4 w-4" />
                    Kargo
                  </span>
                  <span className="font-medium text-[#1a1a1a]">
                    {shippingCost} ₺
                  </span>
                </div>

                <div className="border-t border-[#e8e6e3] pt-3" />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#1a1a1a]">
                    Toplam
                  </span>
                  <span className="font-serif text-2xl font-semibold text-[#0f3f44]">
                    {grandTotal.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !selectedAddressId}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3f44] py-4 font-semibold text-white transition-all hover:bg-[#0a2a2e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    'İşleniyor...'
                  ) : (
                    <>
                      Siparişi Onayla
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-[#666]">
                  Siparişinizi onaylayarak{' '}
                  <a href="#" className="text-[#0f3f44] hover:underline">
                    Kullanım Koşulları
                  </a>
                  'nı kabul etmiş olursunuz
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}