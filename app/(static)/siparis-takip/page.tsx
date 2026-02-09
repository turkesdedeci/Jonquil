'use client';

import { useState } from 'react';
import {
  Package,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  XCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

interface OrderItem {
  id: string;
  product_title: string;
  product_subtitle?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface StatusHistoryItem {
  id: string;
  status: string;
  note?: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  total_amount: number;
  shipping_cost: number;
  created_at: string;
  updated_at: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district?: string;
  customer_first_name: string;
  customer_last_name: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  items: OrderItem[];
  statusHistory: StatusHistoryItem[];
}

const statusConfig = {
  pending: {
    label: 'Ödeme Bekleniyor',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: Clock,
    step: 1
  },
  processing: {
    label: 'Hazırlanıyor',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: Package,
    step: 2
  },
  shipped: {
    label: 'Kargoya Verildi',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: Truck,
    step: 3
  },
  delivered: {
    label: 'Teslim Edildi',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: CheckCircle,
    step: 4
  },
  cancelled: {
    label: 'İptal Edildi',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: XCircle,
    step: 0
  }
};

export default function SiparisTakipPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sipariş bulunamadı');
        return;
      }

      setOrder(data.order);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0f3f44]/10">
          <Package className="h-8 w-8 text-[#0f3f44]" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Sipariş Takip
        </h1>
        <p className="mt-2 text-neutral-600">
          Sipariş numaranız ve e-posta adresinizle siparişinizi takip edin
        </p>
      </div>

      {/* Search Form */}
      {!order && (
        <div className="mx-auto max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#e8e6e3] bg-white p-6 shadow-sm">
            {error && (
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
                <XCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="orderNumber" className="mb-1 block text-sm font-medium text-neutral-700">
                Sipariş Numarası
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                required
                disabled={loading}
                placeholder="JQXXXXXX"
                className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm uppercase outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44] disabled:bg-neutral-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="ornek@email.com"
                className="w-full rounded-lg border border-[#e8e6e3] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0f3f44] focus:ring-1 focus:ring-[#0f3f44] disabled:bg-neutral-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f3f44] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0a2a2e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Siparişi Bul
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setOrder(null)}
            className="flex items-center gap-2 text-sm font-medium text-[#0f3f44] hover:underline"
          >
            ← Yeni arama yap
          </button>

          {/* Order Header */}
          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">Sipariş Numarası</p>
                <p className="text-xl font-bold text-neutral-900">{order.order_number}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Toplam</p>
                <p className="text-2xl font-bold text-[#0f3f44]">
                  {order.total_amount.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
              {(() => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                return (
                  <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${status.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {status.label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Progress Steps */}
          {order.status !== 'cancelled' && (
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
              <h3 className="mb-6 font-semibold text-neutral-900">Sipariş Durumu</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-[#e8e6e3]" />
                {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                  const config = statusConfig[step as keyof typeof statusConfig];
                  const Icon = config.icon;
                  const currentStep = statusConfig[order.status].step;
                  const isCompleted = config.step <= currentStep;
                  const isCurrent = config.step === currentStep;

                  return (
                    <div key={step} className="relative flex items-start gap-4 pb-8 last:pb-0">
                      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isCompleted
                          ? 'bg-[#0f3f44] text-white'
                          : 'bg-white border-2 border-[#e8e6e3] text-neutral-400'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`font-medium ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>
                          {config.label}
                        </p>
                        {isCurrent && order.status === 'shipped' && order.tracking_number && (
                          <div className="mt-2 rounded-lg bg-purple-50 p-3">
                            <p className="text-sm text-purple-700">
                              <strong>Kargo Takip No:</strong> {order.tracking_number}
                            </p>
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:underline"
                              >
                                Kargo Takip <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                        {isCurrent && order.estimated_delivery && (
                          <p className="mt-1 text-sm text-neutral-500">
                            Tahmini teslimat: {formatDate(order.estimated_delivery)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <h3 className="mb-4 font-semibold text-neutral-900">Sipariş Detayları</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-xl bg-[#faf8f5] p-4">
                  {item.product_image && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.product_image}
                        alt={item.product_title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{item.product_title}</p>
                    {item.product_subtitle && (
                      <p className="text-sm text-neutral-500 truncate">{item.product_subtitle}</p>
                    )}
                    <p className="mt-1 text-sm text-neutral-500">
                      {item.quantity} adet × {item.unit_price.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-neutral-900">
                    {item.total_price.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-[#e8e6e3] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Ara Toplam</span>
                <span className="text-neutral-900">
                  {(order.total_amount - order.shipping_cost).toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-neutral-500">Kargo</span>
                <span className="text-neutral-900">
                  {order.shipping_cost > 0 ? `${order.shipping_cost.toLocaleString('tr-TR')} ₺` : 'Ücretsiz'}
                </span>
              </div>
              <div className="mt-3 flex justify-between border-t border-[#e8e6e3] pt-3">
                <span className="font-semibold text-neutral-900">Toplam</span>
                <span className="font-bold text-[#0f3f44]">
                  {order.total_amount.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6">
            <h3 className="mb-4 font-semibold text-neutral-900">Teslimat Adresi</h3>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900">
                  {order.customer_first_name} {order.customer_last_name}
                </p>
                <p className="mt-1 text-neutral-600">
                  {order.shipping_address}
                </p>
                <p className="text-neutral-600">
                  {order.shipping_district && `${order.shipping_district}, `}
                  {order.shipping_city}
                </p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-6 text-center">
            <p className="text-neutral-600">
              Siparişinizle ilgili sorunuz mu var?
            </p>
            <a
              href="/iletisim"
              className="mt-2 inline-flex items-center gap-1 font-medium text-[#0f3f44] hover:underline"
            >
              Bize Ulaşın <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
