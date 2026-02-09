'use client';

// Force dynamic rendering to prevent build-time prerendering with Clerk
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser, useClerk, SignInButton } from '@/hooks/useClerkUser';
import { useCart } from '@/contexts/CartContext';
import { useAlert } from '@/components/AlertModal';
import { motion } from 'framer-motion';
import {
  MapPin,
  ShoppingBag,
  CreditCard,
  Truck,
  ChevronRight,
  Plus,
  Check,
  Shield,
  Lock
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
  const { showError, showWarning, AlertComponent } = useAlert();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [orderNote, setOrderNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [iyzicoFormContent, setIyzicoFormContent] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const iyzicoFormRef = useRef<HTMLDivElement>(null);

  const shippingCost = totalPrice >= 500 ? 0 : 49.90; // 500 TL üzeri ücretsiz kargo
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
      showWarning('Lütfen bir teslimat adresi seçin', 'Adres Gerekli');
      return;
    }

    if (items.length === 0) {
      showWarning('Sepetiniz boş', 'Sepet Boş');
      return;
    }

    if (!acceptedTerms) {
      showWarning('Lütfen satış sözleşmesini kabul edin', 'Sözleşme Onayı');
      return;
    }

    setSubmitting(true);

    try {
      // Seçili adresi bul
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);

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

      // Önce siparişi oluştur
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        showError('Sipariş oluşturulurken hata oluştu', 'Sipariş Hatası');
        return;
      }

      const order = await res.json();

      // Kredi kartı ödemesi için iyzico'yu başlat
      if (paymentMethod === 'card') {
        const nameParts = (selectedAddress?.full_name || 'Misafir Kullanıcı').split(' ');
        const firstName = nameParts[0] || 'Misafir';
        const lastName = nameParts.slice(1).join(' ') || 'Kullanıcı';

        const iyzicoRes = await fetch('/api/iyzico/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            items: items.map(item => ({
              id: item.productId,
              title: item.title,
              category: 'Porselen',
              material: item.material || 'Porselen',
              price: item.price,
              quantity: item.quantity,
            })),
            buyer: {
              id: user?.id || `guest_${Date.now()}`,
              firstName,
              lastName,
              email: user?.emailAddresses?.[0]?.emailAddress || 'guest@jonquil.com',
              phone: selectedAddress?.phone || '+905000000000',
            },
            shippingAddress: {
              address: selectedAddress?.address_line || '',
              city: selectedAddress?.city || 'İstanbul',
              zipCode: selectedAddress?.postal_code || '34000',
            },
            totalPrice: grandTotal.toFixed(2),
          }),
        });

        const iyzicoData = await iyzicoRes.json();

        if (iyzicoData.success && iyzicoData.checkoutFormContent) {
          setIyzicoFormContent(iyzicoData.checkoutFormContent);
          // Scroll to iyzico form
          setTimeout(() => {
            iyzicoFormRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          showError(iyzicoData.error || 'Ödeme başlatılamadı', 'Ödeme Hatası');
        }
      } else {
        // Havale/EFT için doğrudan başarı sayfasına git
        clearCart();
        router.push(`/siparis-basarili?order_id=${order.id}`);
      }
    } catch (error) {
      console.error('Sipariş hatası:', error);
      showError('Bir hata oluştu. Lütfen tekrar deneyin.', 'Hata');
    } finally {
      setSubmitting(false);
    }
  };

  // iyzico form içeriğini render et
  useEffect(() => {
    if (iyzicoFormContent && iyzicoFormRef.current) {
      iyzicoFormRef.current.innerHTML = iyzicoFormContent;
      // Execute any scripts in the form
      const scripts = iyzicoFormRef.current.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = script.textContent;
        script.parentNode?.replaceChild(newScript, script);
      });
    }
  }, [iyzicoFormContent]);

  // Show login modal overlay when not logged in
  const showLoginModal = !user;

  if (showLoginModal) {
    return (
      <div className="relative min-h-screen">
        {/* Blurred background - checkout preview */}
        <div className="pointer-events-none blur-sm">
          <div className="min-h-screen bg-[#faf8f5] py-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-8">
                <h1 className="mb-2 font-serif text-4xl font-light text-[#1a1a1a]">
                  Ödeme
                </h1>
                <p className="text-[#666]">Siparişinizi tamamlamak için bilgilerinizi kontrol edin</p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6 h-64" />
                  <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6 h-48" />
                </div>
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6 h-96" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Lock className="h-8 w-8 text-[#0f3f44]" />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-light text-[#1a1a1a]">
                Giriş Yapın
              </h2>
              <p className="text-sm text-[#666]">
                Ödeme işlemine devam etmek için hesabınıza giriş yapmalısınız
              </p>
            </div>

            <SignInButton
              mode="modal"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "rounded-2xl shadow-2xl",
                  socialButtonsBlockButton: "border border-[#e8e6e3] hover:bg-[#faf8f5]",
                  formButtonPrimary: "bg-[#0f3f44] hover:bg-[#0a2a2e]",
                  footerActionLink: "text-[#0f3f44]",
                }
              }}
            >
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3f44] px-6 py-4 text-base font-semibold text-white transition-all hover:bg-[#0a2a2e]">
                <Lock className="h-5 w-5" />
                Giriş Yap veya Hesap Oluştur
              </button>
            </SignInButton>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-[#666] hover:text-[#0f3f44] hover:underline"
              >
                ← Alışverişe devam et
              </button>
            </div>
          </motion.div>
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
      <AlertComponent />
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-[#0f3f44] hover:underline"
            >
              ← Alışverişe Devam Et
            </button>
          </div>
          <h1 className="mb-2 font-serif text-4xl font-light text-[#1a1a1a]">
            Ödeme
          </h1>
          <p className="text-[#666]">Siparişinizi tamamlamak için bilgilerinizi kontrol edin</p>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f3f44] text-sm font-bold text-white">
                1
              </div>
              <span className="hidden text-sm font-medium text-[#0f3f44] sm:inline">Adres Seçimi</span>
            </div>
            <div className="h-0.5 w-8 bg-[#e8e6e3]" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f3f44] text-sm font-bold text-white">
                2
              </div>
              <span className="hidden text-sm font-medium text-[#0f3f44] sm:inline">Ödeme</span>
            </div>
            <div className="h-0.5 w-8 bg-[#e8e6e3]" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e6e3] text-sm font-bold text-[#666]">
                3
              </div>
              <span className="hidden text-sm font-medium text-[#666] sm:inline">Onay</span>
            </div>
          </div>
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
                  onClick={() => { setPaymentMethod('card'); setIyzicoFormContent(null); }}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#0f3f44] bg-[#0f3f44]/5'
                      : 'border-[#e8e6e3] hover:border-[#0f3f44]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="mb-1 flex items-center gap-2 font-semibold text-[#1a1a1a]">
                          <CreditCard className="h-5 w-5" />
                          Kredi/Banka Kartı
                        </div>
                        <p className="text-sm text-[#666]">
                          iyzico güvenli ödeme ile anında onay
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex h-6 items-center rounded bg-white px-2 text-xs font-bold shadow-sm">
                            iyzico
                          </div>
                          <div className="flex h-6 items-center rounded bg-white px-2 text-xs font-bold text-[#1a1f71] shadow-sm">
                            VISA
                          </div>
                          <div className="flex h-6 items-center rounded bg-white px-2 shadow-sm">
                            <span className="text-xs font-bold text-[#eb001b]">Master</span>
                            <span className="text-xs font-bold text-[#f79e1b]">card</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f3f44]">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => { setPaymentMethod('bank'); setIyzicoFormContent(null); }}
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

              {/* Güvenlik Bilgisi */}
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <Shield className="h-5 w-5" />
                <span>256-bit SSL şifreleme ile güvenli ödeme</span>
              </div>
            </div>

            {/* iyzico Ödeme Formu */}
            {iyzicoFormContent && (
              <div ref={iyzicoFormRef} className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#0f3f44]" />
                  <span className="font-semibold text-[#1a1a1a]">Güvenli Ödeme</span>
                </div>
                {/* iyzico form buraya inject edilecek */}
              </div>
            )}

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
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf8f5]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
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

              {/* Sözleşme Onayı */}
              <div className="mt-6 space-y-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                  />
                  <span className="text-xs text-[#666]">
                    <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-[#0f3f44] hover:underline">
                      Mesafeli Satış Sözleşmesi
                    </a>
                    'ni ve{' '}
                    <a href="/gizlilik-politikasi" target="_blank" className="text-[#0f3f44] hover:underline">
                      Gizlilik Politikası
                    </a>
                    'nı okudum ve kabul ediyorum.
                  </span>
                </label>

                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !selectedAddressId || !acceptedTerms}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3f44] py-4 font-semibold text-white transition-all hover:bg-[#0a2a2e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      İşleniyor...
                    </>
                  ) : paymentMethod === 'card' ? (
                    <>
                      <Lock className="h-5 w-5" />
                      Ödemeye Geç
                    </>
                  ) : (
                    <>
                      Siparişi Onayla
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#666]">
                  <a href="/teslimat-iade" target="_blank" className="text-[#0f3f44] hover:underline">
                    Teslimat ve İade Koşulları
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
