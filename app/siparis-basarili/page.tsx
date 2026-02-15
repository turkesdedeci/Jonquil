'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { clearCartAfterOrder } = useCart();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mark cart as converted (covers iyzico card payment path)
    clearCartAfterOrder();
    if (orderId) {
      fetchOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch {
      // silently fail — order details are optional on success page
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e6e3] border-t-[#0f3f44]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#e8e6e3] bg-white p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6 inline-flex"
          >
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </motion.div>

          {/* Success Message */}
          <h1 className="mb-3 font-serif text-4xl font-light text-[#1a1a1a]">
            Siparişiniz Alındı!
          </h1>
          <p className="mb-8 text-lg text-[#666]">
            Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu.
          </p>

          {/* Order Number */}
          {order && (
            <div className="mb-8 rounded-xl bg-[#faf8f5] p-6">
              <div className="mb-2 text-sm text-[#666]">Sipariş Numaranız</div>
              <div className="font-mono text-2xl font-bold text-[#0f3f44]">
                {order.order_number}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8 space-y-4 text-left">
            <h2 className="mb-4 text-center text-xl font-semibold text-[#1a1a1a]">
              Sırada Ne Var?
            </h2>

            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Package className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <div className="mb-1 font-semibold text-[#1a1a1a]">
                  1. Sipariş Hazırlama
                </div>
                <p className="text-sm text-[#666]">
                  Ürünleriniz özenle paketlenecek ve gönderime hazırlanacak
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Truck className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <div className="mb-1 font-semibold text-[#1a1a1a]">
                  2. Kargoya Teslim
                </div>
                <p className="text-sm text-[#666]">
                  Kargo takip numaranız e-posta ile tarafınıza gönderilecek
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#e8e6e3] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                <Home className="h-5 w-5 text-[#0f3f44]" />
              </div>
              <div>
                <div className="mb-1 font-semibold text-[#1a1a1a]">
                  3. Teslim
                </div>
                <p className="text-sm text-[#666]">
                  Ürünleriniz 2-5 iş günü içinde adresinize teslim edilecek
                </p>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="mb-8 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
            📧 Sipariş onayı e-posta adresinize gönderildi
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push('/hesabim')}
              className="flex-1 rounded-full border-2 border-[#0f3f44] bg-transparent px-6 py-3 font-semibold text-[#0f3f44] transition-all hover:bg-[#0f3f44] hover:text-white"
            >
              Siparişlerim
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 rounded-full bg-[#0f3f44] px-6 py-3 font-semibold text-white transition-all hover:bg-[#0a2a2e]"
            >
              Alışverişe Devam Et
            </button>
          </div>
        </motion.div>

        {/* Order Summary */}
        {order && order.items && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 rounded-2xl border border-[#e8e6e3] bg-white p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-[#1a1a1a]">
              Sipariş Detayları
            </h3>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#faf8f5]">
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1a1a1a]">
                      {item.product_title}
                    </div>
                    <div className="text-sm text-[#666]">
                      {item.quantity} adet × {item.unit_price.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                  <div className="font-semibold text-[#1a1a1a]">
                    {item.total_price.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#e8e6e3] pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-[#1a1a1a]">Toplam</span>
                <span className="text-[#0f3f44]">
                  {order.total_amount.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#e8e6e3] border-t-[#0f3f44] mx-auto"></div>
          <p className="text-[#666]">Yükleniyor...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}