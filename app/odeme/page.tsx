'use client';

// Force dynamic rendering to prevent build-time prerendering with Clerk
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser, SignInButton } from '@/hooks/useClerkUser';
import { useCart } from '@/contexts/CartContext';
import { useAlert } from '@/components/AlertModal';
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
  const [addressSaving, setAddressSaving] = useState(false);
  const [iyzicoFormContent, setIyzicoFormContent] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const iyzicoFormRef = useRef<HTMLDivElement>(null);
  const [checkoutMode, setCheckoutMode] = useState<'login' | 'guest'>('login');
  const isGuest = !user && checkoutMode === 'guest';

  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestDistrict, setGuestDistrict] = useState('');
  const [guestPostalCode, setGuestPostalCode] = useState('');

  const [provinces, setProvinces] = useState<Array<{ id: number; name: string }>>([]);
  const [addressProvinceId, setAddressProvinceId] = useState<number | ''>('');
  const [addressDistricts, setAddressDistricts] = useState<Array<{ id: number; name: string }>>([]);
  const [addressDistrictLoading, setAddressDistrictLoading] = useState(false);
  const [guestProvinceId, setGuestProvinceId] = useState<number | ''>('');
  const [guestDistricts, setGuestDistricts] = useState<Array<{ id: number; name: string }>>([]);
  const [guestDistrictLoading, setGuestDistrictLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: '',
    full_name: '',
    phone: '',
    address_line: '',
    district: '',
    city: '',
    postal_code: '',
    is_default: false,
  });

  const shippingCost = totalPrice >= 500 ? 0 : 49.90; // 500 TL üzeri ücretsiz kargo
  const grandTotal = totalPrice + shippingCost;

  // Adresleri yükle
  useEffect(() => {
    if (user) {
      setCheckoutMode('login');
      loadAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await fetch('https://api.turkiyeapi.dev/v1/provinces');
        const data = await res.json();
        const list = data?.data || [];
        setProvinces(list.map((p: any) => ({ id: p.id, name: p.name })));
      } catch (error) {
        console.error('İller yüklenirken hata:', error);
      }
    };

    loadProvinces();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      if (!addressProvinceId) {
        setAddressDistricts([]);
        return;
      }
      setAddressDistrictLoading(true);
      try {
        const res = await fetch(`https://api.turkiyeapi.dev/v1/districts?provinceId=${addressProvinceId}`);
        const data = await res.json();
        const list = data?.data || [];
        setAddressDistricts(list.map((d: any) => ({ id: d.id, name: d.name })));
      } catch (error) {
        console.error('İlçeler yüklenirken hata:', error);
      } finally {
        setAddressDistrictLoading(false);
      }
    };

    loadDistricts();
  }, [addressProvinceId]);

  useEffect(() => {
    const loadGuestDistricts = async () => {
      if (!guestProvinceId) {
        setGuestDistricts([]);
        return;
      }
      setGuestDistrictLoading(true);
      try {
        const res = await fetch(`https://api.turkiyeapi.dev/v1/districts?provinceId=${guestProvinceId}`);
        const data = await res.json();
        const list = data?.data || [];
        setGuestDistricts(list.map((d: any) => ({ id: d.id, name: d.name })));
      } catch (error) {
        console.error('İlçeler yüklenirken hata:', error);
      } finally {
        setGuestDistrictLoading(false);
      }
    };

    loadGuestDistricts();
  }, [guestProvinceId]);

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

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.title || !addressForm.full_name || !addressForm.address_line || !addressForm.city || !addressForm.district) {
      showWarning('Lütfen tüm zorunlu alanları doldurun', 'Eksik Bilgi');
      return;
    }

    setAddressSaving(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError(data.error || 'Adres kaydedilemedi', 'Adres Hatası');
        return;
      }

      await loadAddresses();
      setShowAddressForm(false);
      setAddressProvinceId('');
      setAddressDistricts([]);
      setAddressForm({
        title: '',
        full_name: '',
        phone: '',
        address_line: '',
        district: '',
        city: '',
        postal_code: '',
        is_default: false,
      });
    } catch (error) {
      console.error('Adres kaydedilirken hata:', error);
      showError('Adres kaydedilemedi', 'Adres Hatası');
    } finally {
      setAddressSaving(false);
    }
  };

  // Sipariş oluştur
  const handleSubmitOrder = async () => {
    if (!user && checkoutMode !== 'guest') {
      showWarning('Lütfen giriş yapın veya üye olmadan devam edin', 'Devam Etme Seçeneği');
      return;
    }
    if (!selectedAddressId && !isGuest) {
      showWarning('Lütfen bir teslimat adresi seçin', 'Adres Gerekli');
      return;
    }
    if (isGuest) {
      if (!guestFirstName || !guestLastName || !guestEmail || !guestPhone || !guestAddress || !guestCity) {
        showWarning('Lütfen misafir bilgilerini doldurun', 'Eksik Bilgi');
        return;
      }
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
        customer: {
          first_name: user?.firstName || guestFirstName,
          last_name: user?.lastName || guestLastName,
          email: user?.emailAddresses?.[0]?.emailAddress || guestEmail,
          phone: selectedAddress?.phone || guestPhone,
        },
        shipping_address: isGuest ? {
          address_line: guestAddress,
          city: guestCity,
          district: guestDistrict,
          postal_code: guestPostalCode,
        } : undefined,
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
        const nameParts = (selectedAddress?.full_name || `${guestFirstName} ${guestLastName}` || 'Misafir Kullanıcı').split(' ');
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
              email: user?.emailAddresses?.[0]?.emailAddress || guestEmail || 'guest@jonquil.com',
              phone: selectedAddress?.phone || guestPhone || '+905000000000',
            },
            shippingAddress: {
              address: selectedAddress?.address_line || guestAddress || '',
              city: selectedAddress?.city || guestCity || 'İstanbul',
              zipCode: selectedAddress?.postal_code || guestPostalCode || '34000',
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

  // Guest checkout is allowed; no login modal

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
            {!user && (
              <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3f44]">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1a1a1a]">
                    Devam Etme Seçeneği
                  </h2>
                </div>
                <p className="mb-4 text-sm text-[#666]">
                  Tavsiyemiz giriş yapmanız. Ama isterseniz üye olmadan da devam edebilirsiniz.
                </p>
                <div className="flex flex-wrap gap-3">
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
                    <button className="rounded-full bg-[#0f3f44] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0a2a2e]">
                      Giriş Yap (Tavsiye Edilen)
                    </button>
                  </SignInButton>
                  <button
                    onClick={() => setCheckoutMode('guest')}
                    className="rounded-full border border-[#e8e6e3] bg-white px-6 py-3 text-sm font-semibold text-[#1a1a1a] hover:border-[#0f3f44]"
                  >
                    Üye Olmadan Devam Et
                  </button>
                </div>
              </div>
            )}

            {(user || isGuest) && (
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
                  {!isGuest && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 text-sm font-medium text-[#0f3f44] hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      Yeni Adres
                    </button>
                  )}
                </div>

                {!isGuest && showAddressForm && (
                  <div className="mb-6 rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-4">
                    <form onSubmit={handleCreateAddress} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Adres Başlığı *</label>
                          <input
                            type="text"
                            value={addressForm.title}
                            onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                            required
                            className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Ad Soyad *</label>
                          <input
                            type="text"
                            value={addressForm.full_name}
                            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                            required
                            className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Telefon *</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Adres *</label>
                        <textarea
                          value={addressForm.address_line}
                          onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })}
                          rows={3}
                          required
                          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <select
                          value={addressProvinceId}
                          onChange={(e) => {
                            const nextId = e.target.value ? Number(e.target.value) : '';
                            setAddressProvinceId(nextId);
                            const province = provinces.find(p => p.id === nextId);
                            setAddressForm({
                              ...addressForm,
                              city: province?.name || '',
                              district: '',
                            });
                          }}
                          required
                          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                        >
                          <option value="">İl seçin</option>
                          {provinces.map((province) => (
                            <option key={province.id} value={province.id}>{province.name}</option>
                          ))}
                        </select>
                        <select
                          value={addressForm.district}
                          onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                          required
                          disabled={!addressProvinceId || addressDistrictLoading}
                          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44] disabled:bg-[#faf8f5]"
                        >
                          <option value="">{addressDistrictLoading ? 'Yükleniyor...' : 'İlçe seçin'}</option>
                          {addressDistricts.map((district) => (
                            <option key={district.id} value={district.name}>{district.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={addressForm.postal_code}
                          onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                          placeholder="Posta Kodu"
                          className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-sm text-[#666]">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                          className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                        />
                        Varsayılan adres olarak ayarla
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={addressSaving}
                          className="flex-1 rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e] disabled:opacity-50"
                        >
                          {addressSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1 rounded-lg border border-[#e8e6e3] px-4 py-2 text-sm font-medium text-[#1a1a1a] hover:bg-white"
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {isGuest ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        placeholder="Ad"
                        className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                      />
                      <input
                        type="text"
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        placeholder="Soyad"
                        className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="E-posta"
                        className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                      />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Telefon"
                        className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                      />
                    </div>
                    <textarea
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      placeholder="Adres"
                      rows={3}
                      className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <select
                        value={guestProvinceId}
                        onChange={(e) => {
                          const nextId = e.target.value ? Number(e.target.value) : '';
                          setGuestProvinceId(nextId);
                          const province = provinces.find(p => p.id === nextId);
                          setGuestCity(province?.name || '');
                          setGuestDistrict('');
                        }}
                        className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                      >
                        <option value="">İl seçin</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.id}>{province.name}</option>
                        ))}
                      </select>
                      <select
                        value={guestDistrict}
                        onChange={(e) => setGuestDistrict(e.target.value)}
                        disabled={!guestProvinceId || guestDistrictLoading}
                        className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44] disabled:bg-[#faf8f5]"
                      >
                        <option value="">{guestDistrictLoading ? 'Yükleniyor...' : 'İlçe seçin'}</option>
                        {guestDistricts.map((district) => (
                          <option key={district.id} value={district.name}>{district.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={guestPostalCode}
                        onChange={(e) => setGuestPostalCode(e.target.value)}
                        placeholder="Posta Kodu"
                        className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none focus:border-[#0f3f44]"
                      />
                    </div>
                  </div>
                ) : loading ? (
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
            )}

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
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <Image
                            src="/images/iyzico_ile_ode_colored.png"
                            alt="iyzico ile öde"
                            width={73}
                            height={20}
                            className="h-4 w-auto"
                          />
                          <span>güvenli ödeme ile anında onay</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="flex h-6 items-center rounded bg-white px-2 shadow-sm">
                            <Image
                              src="/images/iyzico_ile_ode_colored.png"
                              alt="iyzico ile öde"
                              width={73}
                              height={20}
                              className="h-4 w-auto"
                            />
                          </div>
                          <div className="flex h-6 items-center rounded bg-white px-2 shadow-sm">
                            <Image
                              src="/images/visa-brandmark-blue-1960x622.webp"
                              alt="Visa"
                              width={73}
                              height={20}
                              className="h-4 w-auto"
                            />
                          </div>
                          <div className="flex h-6 items-center rounded bg-white px-2 shadow-sm">
                            <Image
                              src="/images/ma_symbol_opt_73_3x.png"
                              alt="Mastercard"
                              width={73}
                              height={20}
                              className="h-4 w-auto"
                            />
                          </div>
                          <span className="text-xs text-[#666]">Güvenli ödeme ile anında onay</span>
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
                    <a href="/on-bilgilendirme-formu" target="_blank" className="text-[#0f3f44] hover:underline">
                      Ön Bilgilendirme Formu
                    </a>
                    'nu ve{' '}
                    <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-[#0f3f44] hover:underline">
                      Mesafeli Satış Sözleşmesi
                    </a>
                    'ni okudum ve kabul ediyorum.
                  </span>
                </label>

                <p className="text-xs text-[#999]">
                  <a href="/uyelik-sozlesmesi" target="_blank" className="text-[#0f3f44] hover:underline">
                    Üyelik Sözleşmesi
                  </a>
                  ,{' '}
                  <a href="/kisisel-veriler-politikasi" target="_blank" className="text-[#0f3f44] hover:underline">
                    Kişisel Veriler Politikası (KVKK)
                  </a>
                  ,{' '}
                  <a href="/gizlilik-guvenlik-politikasi" target="_blank" className="text-[#0f3f44] hover:underline">
                    Gizlilik ve Güvenlik Politikası
                  </a>
                  ,{' '}
                  <a href="/iptal-iade-proseduru" target="_blank" className="text-[#0f3f44] hover:underline">
                    İptal ve İade Prosedürü
                  </a>
                  .
                </p>

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
