'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
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
  pending: {
    label: 'Ödeme Bekleniyor',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  processing: {
    label: 'Hazırlanıyor',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
  },
  shipped: {
    label: 'Kargoda',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
  },
  delivered: {
    label: 'Teslim Edildi',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'İptal Edildi',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export function SiparislerimTab() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
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

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e6e3] border-t-[#0f3f44]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1a1a1a]">Siparişlerim</h2>
        <div className="text-sm text-[#666]">{orders.length} sipariş</div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e8e6e3] bg-[#faf8f5] p-12 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-[#e8e6e3]" />
          <p className="mb-2 font-medium text-[#1a1a1a]">Henüz sipariş yok</p>
          <p className="mb-4 text-sm text-[#666]">
            İlk siparişinizi vererek koleksiyonumuzu keşfedin
          </p>
          <button
            onClick={() => (window.location.hash = '#/urunler')}
            className="rounded-lg bg-[#0f3f44] px-6 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]"
          >
            Alışverişe Başla
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-[#e8e6e3] bg-white transition-shadow hover:shadow-md"
              >
                {/* Order Header */}
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-[#1a1a1a]">
                          {order.order_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                      </div>
                      <div className="text-sm text-[#666]">
                        {formatDate(order.created_at)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-[#666]">Toplam</div>
                      <div className="font-serif text-xl font-semibold text-[#0f3f44]">
                        {order.total_amount.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="h-10 w-10 overflow-hidden rounded-lg border-2 border-white bg-[#faf8f5]"
                          >
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_title}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-[#666]">
                        {order.items.length} ürün
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleOrderDetails(order.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e8e6e3] py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#faf8f5]"
                    >
                      {isExpanded ? (
                        <>
                          Gizle
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Detayları Gör
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {order.status === 'delivered' && (
                      <button className="flex-1 rounded-lg bg-[#0f3f44] py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]">
                        Tekrar Sipariş Ver
                      </button>
                    )}

                    {order.status === 'shipped' && (
                      <button className="flex-1 rounded-lg bg-[#0f3f44] py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]">
                        Kargoyu Takip Et
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Details - Expandable */}
                <AnimatePresence>
                  {isExpanded && order.items && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-[#e8e6e3] bg-[#faf8f5]"
                    >
                      <div className="p-6">
                        <h3 className="mb-4 text-sm font-semibold text-[#1a1a1a]">
                          Sipariş Detayları
                        </h3>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 rounded-lg bg-white p-3"
                            >
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf8f5]">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_title}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 text-sm font-medium text-[#1a1a1a]">
                                  {item.product_title}
                                </div>
                                {item.product_subtitle && (
                                  <div className="text-xs text-[#666]">
                                    {item.product_subtitle}
                                  </div>
                                )}
                                <div className="mt-1 text-xs text-[#666]">
                                  {item.quantity} adet × {item.unit_price.toLocaleString('tr-TR')} ₺
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-[#1a1a1a]">
                                  {item.total_price.toLocaleString('tr-TR')} ₺
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Timeline */}
                        <div className="mt-6 border-t border-[#e8e6e3] pt-6">
                          <h3 className="mb-4 text-sm font-semibold text-[#1a1a1a]">
                            Sipariş Durumu
                          </h3>
                          <div className="space-y-3">
                            <div className={`flex items-start gap-3 ${
                              order.status === 'pending' || order.status === 'processing' || 
                              order.status === 'shipped' || order.status === 'delivered'
                                ? 'text-[#1a1a1a]'
                                : 'text-[#999]'
                            }`}>
                              <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                                order.status === 'pending' || order.status === 'processing' || 
                                order.status === 'shipped' || order.status === 'delivered'
                                  ? 'bg-[#0f3f44]'
                                  : 'bg-[#e8e6e3]'
                              }`}>
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Sipariş Alındı</div>
                                <div className="text-xs text-[#666]">
                                  {formatDate(order.created_at)}
                                </div>
                              </div>
                            </div>

                            <div className={`flex items-start gap-3 ${
                              order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                                ? 'text-[#1a1a1a]'
                                : 'text-[#999]'
                            }`}>
                              <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                                order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                                  ? 'bg-[#0f3f44]'
                                  : 'bg-[#e8e6e3]'
                              }`}>
                                <Package className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Hazırlanıyor</div>
                                <div className="text-xs text-[#666]">
                                  Ürünleriniz paketleniyor
                                </div>
                              </div>
                            </div>

                            <div className={`flex items-start gap-3 ${
                              order.status === 'shipped' || order.status === 'delivered'
                                ? 'text-[#1a1a1a]'
                                : 'text-[#999]'
                            }`}>
                              <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                                order.status === 'shipped' || order.status === 'delivered'
                                  ? 'bg-[#0f3f44]'
                                  : 'bg-[#e8e6e3]'
                              }`}>
                                <Truck className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Kargoya Verildi</div>
                                <div className="text-xs text-[#666]">
                                  Tahmini teslimat: 2-5 iş günü
                                </div>
                              </div>
                            </div>

                            <div className={`flex items-start gap-3 ${
                              order.status === 'delivered' ? 'text-[#1a1a1a]' : 'text-[#999]'
                            }`}>
                              <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                                order.status === 'delivered' ? 'bg-green-600' : 'bg-[#e8e6e3]'
                              }`}>
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Teslim Edildi</div>
                                <div className="text-xs text-[#666]">
                                  Afiyet olsun!
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}