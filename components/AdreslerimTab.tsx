'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useClerkUser';

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

export function AdreslerimTab() {
  const { user } = useUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    full_name: '',
    phone: '',
    address_line: '',
    district: '',
    city: '',
    postal_code: '',
    is_default: false,
  });

  // Adresleri yükle
  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? '/api/addresses' : '/api/addresses';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await loadAddresses();
        setShowForm(false);
        setEditingId(null);
        resetForm();
      }
    } catch (error) {
      console.error('Adres kaydedilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adres sil
  const handleDelete = async (id: string) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadAddresses();
      }
    } catch (error) {
      console.error('Adres silinirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Düzenle
  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      title: address.title,
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      district: address.district,
      city: address.city,
      postal_code: address.postal_code || '',
      is_default: address.is_default,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      full_name: '',
      phone: '',
      address_line: '',
      district: '',
      city: '',
      postal_code: '',
      is_default: false,
    });
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e6e3] border-t-[#0f3f44]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1a1a1a]">Kayıtlı Adreslerim</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]"
          >
            + Yeni Adres Ekle
          </button>
        )}
      </div>

      {/* Adres Formu */}
      {showForm && (
        <div className="rounded-xl border border-[#e8e6e3] bg-white p-6">
          <h3 className="mb-4 font-medium text-[#1a1a1a]">
            {editingId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Adres Başlığı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ev Adresi, İş Adresi vb."
                  required
                  className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                Telefon *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+90 555 123 4567"
                required
                className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                Adres *
              </label>
              <textarea
                value={formData.address_line}
                onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                placeholder="Mahalle, Sokak, Bina No, Daire No"
                required
                rows={3}
                className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  İlçe *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  İl *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Posta Kodu
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
              />
              <label htmlFor="is_default" className="text-sm text-[#666]">
                Varsayılan adres olarak ayarla
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-[#0f3f44] py-2 text-sm font-medium text-white hover:bg-[#0a2a2e] disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="flex-1 rounded-lg border border-[#e8e6e3] py-2 text-sm font-medium text-[#1a1a1a] hover:bg-[#faf8f5]"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adresler Listesi */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e8e6e3] bg-[#faf8f5] p-12 text-center">
            <p className="mb-2 font-medium text-[#1a1a1a]">Henüz kayıtlı adres yok</p>
            <p className="text-sm text-[#666]">Hızlı teslimat için adresinizi ekleyin</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="rounded-xl border border-[#e8e6e3] bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-medium text-[#1a1a1a]">{address.title}</span>
                    {address.is_default && (
                      <span className="rounded-full bg-[#0f3f44] px-2 py-0.5 text-xs text-white">
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#666]">
                    <strong>{address.full_name}</strong><br />
                    {address.address_line}<br />
                    {address.district}, {address.city} {address.postal_code}<br />
                    Tel: {address.phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-sm text-[#0f3f44] hover:underline"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}