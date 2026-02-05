'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useClerkUser';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  TrendingUp,
  Users,
  RefreshCw,
  ChevronDown,
  Search,
  Home
} from 'lucide-react';

// Admin email listesi
const ADMIN_EMAILS = ['turkesdedeci@icloud.com'];

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_email?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shipping_address?: any;
}

interface OrderItem {
  id: string;
  product_title: string;
  product_subtitle?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const statusConfig = {
  pending: { label: 'Ödeme Bekleniyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Kargoda', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const statusOrder: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Admin kontrolü
  const isAdmin = user?.emailAddresses?.some(
    email => ADMIN_EMAILS.includes(email.emailAddress)
  );

  useEffect(() => {
    if (isLoaded && isAdmin) {
      loadOrders();
    }
  }, [isLoaded, isAdmin]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Yükleniyor
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0f3f44]" />
      </div>
    );
  }

  // Giriş yapılmamış
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Giriş Gerekli</h1>
          <p className="mb-4 text-gray-600">Admin paneline erişmek için giriş yapmalısınız.</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-[#0f3f44] px-6 py-2 text-white hover:bg-[#0a2a2e]"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Yetkisiz kullanıcı
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Yetkisiz Erişim</h1>
          <p className="mb-4 text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-[#0f3f44] px-6 py-2 text-white hover:bg-[#0a2a2e]"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // İstatistikler
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0),
  };

  // Filtreleme
  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .filter(order =>
      searchTerm === '' ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <span className="rounded-full bg-[#0f3f44] px-3 py-1 text-xs font-medium text-white">
              JONQUIL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]"
            >
              <Home className="h-4 w-4" />
              Siteye Dön
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* İstatistik Kartları */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Sipariş</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bekleyen</p>
                <p className="mt-1 text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kargoda</p>
                <p className="mt-1 text-3xl font-bold text-purple-600">{stats.shipped}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Gelir</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {stats.totalRevenue.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Sipariş no veya email ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-[#0f3f44] focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#0f3f44] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tümü ({stats.total})
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`hidden rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:block ${
                  filter === key
                    ? 'bg-[#0f3f44] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sipariş Listesi */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0f3f44]" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-gray-500">Sipariş bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                >
                  {/* Sipariş Header */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <span className="font-mono text-lg font-bold text-gray-900">
                            {order.order_number}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-500">
                          <p>{formatDate(order.created_at)}</p>
                          {order.user_email && <p>Müşteri: {order.user_email}</p>}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Toplam</p>
                        <p className="text-2xl font-bold text-[#0f3f44]">
                          {order.total_amount.toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    </div>

                    {/* Durum Güncelleme */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Durumu Güncelle:</span>
                      <div className="flex flex-wrap gap-2">
                        {statusOrder.map((s) => {
                          const config = statusConfig[s];
                          const isCurrentStatus = order.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => !isCurrentStatus && updateOrderStatus(order.id, s)}
                              disabled={isCurrentStatus || updating === order.id}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                isCurrentStatus
                                  ? config.color + ' ring-2 ring-offset-1 ring-gray-400'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {updating === order.id ? '...' : config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detay Toggle */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="mt-4 flex items-center gap-1 text-sm font-medium text-[#0f3f44] hover:underline"
                    >
                      {isExpanded ? 'Detayları Gizle' : 'Detayları Göster'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Sipariş Detayları */}
                  {isExpanded && order.items && (
                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                      <h4 className="mb-4 font-medium text-gray-900">Ürünler</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 rounded-lg bg-white p-3">
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_title}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product_title}</p>
                              {item.product_subtitle && (
                                <p className="text-sm text-gray-500">{item.product_subtitle}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                {item.quantity} adet × {item.unit_price.toLocaleString('tr-TR')} ₺
                              </p>
                            </div>
                            <p className="font-bold text-gray-900">
                              {item.total_price.toLocaleString('tr-TR')} ₺
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
