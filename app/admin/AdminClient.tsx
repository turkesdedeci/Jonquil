'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUser } from '@/hooks/useClerkUser';
import { useRouter } from 'next/navigation';

// This component is loaded dynamically with SSR disabled
import Image from 'next/image';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Search,
  Home,
  Eye,
  X,
  Download,
  Layers,
  ExternalLink,
  Plus,
  Save,
  Trash2,
  Upload,
  ImagePlus,
  Edit2,
  AlertTriangle,
  Database
} from 'lucide-react';
import { allProducts } from '@/data/products';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_email?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: string;
  total_amount: number;
  shipping_cost?: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shipping_address?: string;
  shipping_city?: string;
  shipping_district?: string;
  tracking_number?: string;
  tracking_url?: string;
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

type Tab = 'orders' | 'products';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingModal, setTrackingModal] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>({});
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [stockTableExists, setStockTableExists] = useState(true);
  const [settingUpTable, setSettingUpTable] = useState(false);
  const [setupMessage, setSetupMessage] = useState<{type: 'success' | 'error' | 'info', text: string, sql?: string} | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // New product states
  const [showProductModal, setShowProductModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [productFormMessage, setProductFormMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    subtitle: '',
    price: '',
    collection: 'aslan',
    family: '',
    product_type: '',
    material: 'Porselen',
    color: '',
    size: '',
    capacity: '',
    code: '',
    images: [] as string[],
    in_stock: true
  });

  // Default empty product for reset
  const emptyProduct = {
    title: '',
    subtitle: '',
    price: '',
    collection: 'aslan',
    family: '',
    product_type: '',
    material: 'Porselen',
    color: '',
    size: '',
    capacity: '',
    code: '',
    images: [] as string[],
    in_stock: true
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setProductFormMessage(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          const error = await res.json();
          throw new Error(error.error || 'Yükleme hatası');
        }
      }

      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      setProductFormMessage({ type: 'success', text: `${uploadedUrls.length} resim yüklendi` });
    } catch (error: any) {
      setProductFormMessage({ type: 'error', text: error.message || 'Resim yüklenemedi' });
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Remove image from list
  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Extract unique values from existing products for dropdown suggestions
  const existingValues = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const capacities = new Set<string>();
    const materials = new Set<string>();
    const productTypes = new Set<string>();
    const families = new Set<string>();

    allProducts.forEach(p => {
      if (p.color) colors.add(p.color);
      if (p.size) sizes.add(p.size);
      if (p.capacity) capacities.add(p.capacity);
      if (p.material) materials.add(p.material);
      if (p.productType) productTypes.add(p.productType);
      if (p.family) families.add(p.family);
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      capacities: Array.from(capacities).sort(),
      materials: Array.from(materials).sort(),
      productTypes: Array.from(productTypes).sort(),
      families: Array.from(families).sort(),
    };
  }, []);

    // Ürün filtreleme - combine static and database products
  const allCombinedProducts = useMemo(() => {
    // Transform dbProducts to match allProducts format
    const transformedDbProducts = dbProducts.map(p => ({
      ...p,
      productType: p.product_type,
      setSingle: p.set_single,
      isFromDatabase: true,
    }));
    return [...transformedDbProducts, ...allProducts];
  }, [dbProducts]);


  
  // Determine which fields to show based on product type
  const fieldVisibility = useMemo(() => {
    const type = newProduct.product_type?.toLowerCase() || '';

    // Products that need capacity: Fincan, Kupa, Set
    const needsCapacity = ['fincan', 'kupa', 'set', 'bardak'].some(t => type.includes(t));

    // Products that need size: Almost all except some
    const needsSize = true; // Most products have size

    return {
      showCapacity: needsCapacity || type === '', // Show if relevant or no type selected yet
      showSize: needsSize,
    };
  }, [newProduct.product_type]);

  // Ref to prevent duplicate admin check requests
  const adminCheckRef = useRef(false);
  const dataLoadedRef = useRef(false);

  // Admin kontrolü - server-side'dan kontrol et
  // user?.id kullanarak obje referans değişikliklerinden kaynaklanan re-render'ları önle
  const userId = user?.id;

  useEffect(() => {
    // Prevent duplicate requests
    if (adminCheckRef.current) return;

    if (isLoaded && userId) {
      adminCheckRef.current = true;
      fetch('/api/admin/check')
        .then(res => res.json())
        .then(data => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    } else if (isLoaded && !userId) {
      setIsAdmin(false);
    }
  }, [isLoaded, userId]);

  // Load data functions with useCallback to prevent re-creation
  const loadDbProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products/manage');
      if (res.ok) {
        const data = await res.json();
        setDbProducts(data.products || []);
      }
    } catch (error) {
      console.error('DB ürünleri yüklenirken hata:', error);
    }
  }, []);

  const loadStockStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setStockStatus(data.stockStatus || {});
        setStockTableExists(data.tableExists !== false);
      }
    } catch (error) {
      console.error('Stok durumu yüklenirken hata:', error);
      setStockTableExists(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
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
  }, []);

  // Load admin data when admin status is confirmed
  useEffect(() => {
    if (isAdmin === true && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      loadOrders();
      loadStockStatus();
      loadDbProducts();
    }
  }, [isAdmin, loadOrders, loadStockStatus, loadDbProducts]);

  const saveProduct = async () => {
    if (!newProduct.title || !newProduct.price) {
      setProductFormMessage({ type: 'error', text: 'Ürün adı ve fiyat gerekli' });
      return;
    }

    setSavingProduct(true);
    setProductFormMessage(null);

    const isEditing = !!editingProductId;

    try {
      const res = await fetch('/api/admin/products/manage', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: editingProductId, ...newProduct } : newProduct),
      });

      const data = await res.json();

      if (res.ok) {
        setProductFormMessage({ type: 'success', text: isEditing ? 'Ürün güncellendi!' : 'Ürün başarıyla eklendi!' });

        if (isEditing) {
          setDbProducts(prev => prev.map(p => p.id === editingProductId ? data.product : p));
        } else {
          setDbProducts(prev => [data.product, ...prev]);
        }

        setTimeout(() => {
          setShowProductModal(false);
          setProductFormMessage(null);
          setEditingProductId(null);
          setNewProduct(emptyProduct);
        }, 1500);
      } else {
        setProductFormMessage({ type: 'error', text: data.error || 'İşlem başarısız' });
      }
    } catch (error) {
      setProductFormMessage({ type: 'error', text: 'Bağlantı hatası' });
    } finally {
      setSavingProduct(false);
    }
  };

  // Open edit modal with product data
  const openEditModal = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      title: product.title || '',
      subtitle: product.subtitle || '',
      price: product.price || '',
      collection: product.collection || 'aslan',
      family: product.family || '',
      product_type: product.product_type || product.productType || '',
      material: product.material || 'Porselen',
      color: product.color || '',
      size: product.size || '',
      capacity: product.capacity || '',
      code: product.code || '',
      images: product.images || [],
      in_stock: product.in_stock !== false
    });
    setShowProductModal(true);
  };

  // Open new product modal
  const openNewProductModal = () => {
    setEditingProductId(null);
    setNewProduct(emptyProduct);
    setShowProductModal(true);
  };

  // Delete product with confirmation
  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;

    setDeletingProduct(true);
    try {
      const res = await fetch(`/api/admin/products/manage?id=${deleteConfirmId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDbProducts(prev => prev.filter(p => p.id !== deleteConfirmId));
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
    } finally {
      setDeletingProduct(false);
    }
  };

  const setupStockTable = async () => {
    setSettingUpTable(true);
    setSetupMessage(null);
    try {
      const res = await fetch('/api/admin/setup-stock-table', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setSetupMessage({ type: 'success', text: data.message });
        setStockTableExists(true);
        loadStockStatus();
      } else if (data.sql) {
        setSetupMessage({ type: 'info', text: data.message, sql: data.sql });
      } else {
        setSetupMessage({ type: 'error', text: data.error || 'Bir hata oluştu' });
      }
    } catch (error) {
      setSetupMessage({ type: 'error', text: 'Bağlantı hatası' });
    } finally {
      setSettingUpTable(false);
    }
  };

  const toggleStockStatus = async (productId: string) => {
    const currentStatus = stockStatus[productId] !== false; // Default true (in stock)
    const newStatus = !currentStatus;

    setUpdatingStock(productId);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, inStock: newStatus }),
      });

      if (res.ok) {
        setStockStatus(prev => ({ ...prev, [productId]: newStatus }));
      }
    } catch (error) {
      console.error('Stok durumu güncellenirken hata:', error);
    } finally {
      setUpdatingStock(null);
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

  const updateTracking = async () => {
    if (!trackingModal) return;
    setUpdating(trackingModal.id);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: trackingModal.id,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          status: 'shipped'
        }),
      });

      if (res.ok) {
        setOrders(orders.map(order =>
          order.id === trackingModal.id
            ? { ...order, tracking_number: trackingNumber, tracking_url: trackingUrl, status: 'shipped' }
            : order
        ));
        setTrackingModal(null);
        setTrackingNumber('');
        setTrackingUrl('');
      }
    } catch (error) {
      console.error('Kargo bilgisi güncellenirken hata:', error);
    } finally {
      setUpdating(null);
    }
  };

  const exportOrders = () => {
    const csv = [
      ['Sipariş No', 'Tarih', 'Müşteri', 'Email', 'Durum', 'Toplam'].join(','),
      ...filteredOrders.map(o => [
        o.order_number,
        new Date(o.created_at).toLocaleDateString('tr-TR'),
        `${o.customer_first_name || ''} ${o.customer_last_name || ''}`.trim(),
        o.user_email || '',
        statusConfig[o.status].label,
        o.total_amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `siparisler-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Yükleniyor (kullanıcı ve admin durumu kontrol ediliyor)
  if (!isLoaded || isAdmin === null) {
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
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredProducts = allCombinedProducts
    .filter(p => productFilter === 'all' || p.collection === productFilter)
    .filter(p =>
      productSearch === '' ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subtitle?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code?.toLowerCase().includes(productSearch.toLowerCase())
    );

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
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]"
            >
              <Home className="h-4 w-4" />
              Siteye Dön
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-[#0f3f44] text-[#0f3f44]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Siparişler
              {stats.pending > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'border-[#0f3f44] text-[#0f3f44]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers className="h-4 w-4" />
              Ürünler
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {allCombinedProducts.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <>
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
                  placeholder="Sipariş no, müşteri adı veya email ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadOrders}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Yenile
                </button>
                <button
                  onClick={exportOrders}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Dışa Aktar
                </button>
              </div>
            </div>

            {/* Status Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
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
              {Object.entries(statusConfig).map(([key, config]) => {
                const count = orders.filter(o => o.status === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      filter === key
                        ? 'bg-[#0f3f44] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {config.label} ({count})
                  </button>
                );
              })}
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
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sipariş</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Müşteri</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Durum</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Toplam</th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tarih</th>
                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => {
                        const status = statusConfig[order.status];
                        const StatusIcon = status.icon;

                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="font-mono font-medium text-gray-900">{order.order_number}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {order.customer_first_name} {order.customer_last_name}
                                </p>
                                <p className="text-sm text-gray-500">{order.user_email}</p>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {status.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="font-semibold text-gray-900">
                                {order.total_amount.toLocaleString('tr-TR')} ₺
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                  title="Detayları Gör"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {order.status === 'processing' && (
                                  <button
                                    onClick={() => {
                                      setTrackingModal(order);
                                      setTrackingNumber(order.tracking_number || '');
                                      setTrackingUrl(order.tracking_url || '');
                                    }}
                                    className="rounded-lg p-2 text-purple-500 hover:bg-purple-50 hover:text-purple-700"
                                    title="Kargo Bilgisi Ekle"
                                  >
                                    <Truck className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <>
            {/* Stock Table Setup Warning */}
            {!stockTableExists && (
              <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-800">Stok Yönetimi Kurulumu Gerekli</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Stok yönetimi için veritabanı tablosu henüz oluşturulmamış. Aşağıdaki butona tıklayarak kurulumu başlatabilirsiniz.
                    </p>
                    {setupMessage && (
                      <div className={`mt-3 rounded-lg p-3 ${
                        setupMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                        setupMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        <p className="text-sm font-medium">{setupMessage.text}</p>
                        {setupMessage.sql && (
                          <pre className="mt-2 overflow-x-auto rounded bg-white p-3 text-xs text-gray-800">
                            {setupMessage.sql}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={setupStockTable}
                    disabled={settingUpTable}
                    className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {settingUpTable ? 'Kuruluyor...' : 'Tabloyu Kur'}
                  </button>
                </div>
              </div>
            )}

            {/* Ürün Filtreler */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün adı veya kodu ara..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
              >
                <option value="all">Tüm Koleksiyonlar</option>
                <option value="aslan">Aslan Koleksiyonu</option>
                <option value="ottoman">Ottoman Koleksiyonu</option>
              </select>
              <button
                onClick={openNewProductModal}
                className="flex items-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e]"
              >
                <Plus className="h-4 w-4" />
                Yeni Ürün Ekle
              </button>
            </div>

            {/* Ürün Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{allCombinedProducts.length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Stokta</p>
                <p className="text-2xl font-bold text-green-600">
                  {allCombinedProducts.filter(p => stockStatus[p.id] !== false).length}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Tükendi</p>
                <p className="text-2xl font-bold text-red-600">
                  {allCombinedProducts.filter(p => stockStatus[p.id] === false).length}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Koleksiyonlar</p>
                <p className="text-2xl font-bold text-purple-600">2</p>
              </div>
            </div>

            {/* Ürün Listesi */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const isInStock = stockStatus[product.id] !== false;
                const isUpdating = updatingStock === product.id;

                return (
                  <div
                    key={product.id}
                    className={`overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md ${
                      isInStock ? 'border-gray-200' : 'border-red-200'
                    }`}
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0].startsWith('/') ? product.images[0] : `/${product.images[0]}`}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className={`object-cover ${!isInStock ? 'opacity-50 grayscale' : ''}`}
                        />
                      )}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.collection === 'aslan'
                            ? 'bg-[#0f3f44] text-white'
                            : 'bg-purple-600 text-white'
                        }`}>
                          {product.collection === 'aslan' ? 'Aslan' : 'Ottoman'}
                        </span>
                        {product.isFromDatabase && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                            <Database className="h-3 w-3" />
                            DB
                          </span>
                        )}
                        {!isInStock && (
                          <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                            Tükendi
                          </span>
                        )}
                      </div>
                      {/* Edit/Delete buttons for DB products */}
                      {product.isFromDatabase && (
                        <div className="absolute right-2 top-2 flex gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm hover:bg-white hover:text-blue-600"
                            title="Düzenle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm hover:bg-white hover:text-red-600"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className={`font-medium line-clamp-1 ${isInStock ? 'text-gray-900' : 'text-gray-400'}`}>
                        {product.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.subtitle}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`font-bold ${isInStock ? 'text-[#0f3f44]' : 'text-gray-400 line-through'}`}>
                          {product.price}
                        </span>
                        <span className="text-xs text-gray-400">{product.code}</span>
                      </div>

                      {/* Stok Toggle */}
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-sm text-gray-600">Stok Durumu</span>
                        <button
                          onClick={() => toggleStockStatus(product.id)}
                          disabled={isUpdating}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isInStock ? 'bg-green-500' : 'bg-gray-300'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              isInStock ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <Layers className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="text-gray-500">Ürün bulunamadı</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-500">Sipariş Durumu</h3>
                <div className="flex flex-wrap gap-2">
                  {statusOrder.map((s) => {
                    const config = statusConfig[s];
                    const isCurrentStatus = selectedOrder.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          if (!isCurrentStatus) {
                            updateOrderStatus(selectedOrder.id, s);
                            setSelectedOrder({ ...selectedOrder, status: s });
                          }
                        }}
                        disabled={isCurrentStatus || updating === selectedOrder.id}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          isCurrentStatus
                            ? config.color + ' ring-2 ring-offset-1 ring-gray-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:cursor-not-allowed`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-500">Müşteri Bilgileri</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">
                    {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}
                  </p>
                  <p className="text-sm text-gray-600">{selectedOrder.user_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-500">Teslimat Adresi</h3>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-gray-900">{selectedOrder.shipping_address}</p>
                    <p className="text-gray-600">
                      {selectedOrder.shipping_district && `${selectedOrder.shipping_district}, `}
                      {selectedOrder.shipping_city}
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking Info */}
              {selectedOrder.tracking_number && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-500">Kargo Bilgileri</h3>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <p className="font-medium text-purple-900">
                      Takip No: {selectedOrder.tracking_number}
                    </p>
                    {selectedOrder.tracking_url && (
                      <a
                        href={selectedOrder.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-purple-700 hover:underline"
                      >
                        Kargo Takip <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-500">Ürünler</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                        {item.product_image && (
                          <Image
                            src={item.product_image}
                            alt={item.product_title}
                            width={64}
                            height={64}
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

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span className="text-[#0f3f44]">
                    {selectedOrder.total_amount.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Kargo Bilgisi Ekle</h2>
              <button
                onClick={() => setTrackingModal(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kargo Takip Numarası
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Örn: 1234567890"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kargo Takip Linki (Opsiyonel)
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                />
              </div>

              <button
                onClick={updateTracking}
                disabled={!trackingNumber || updating === trackingModal.id}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-3 text-sm font-medium text-white hover:bg-[#0a2a2e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating === trackingModal.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    Kaydet ve Kargoya Ver
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setProductFormMessage(null);
                  setEditingProductId(null);
                  setNewProduct(emptyProduct);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {productFormMessage && (
                <div className={`rounded-lg p-3 ${
                  productFormMessage.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <p className="text-sm font-medium">{productFormMessage.text}</p>
                </div>
              )}

              {/* Required Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Porselen Pasta Tabağı"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fiyat *
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newProduct.price.replace(/[^\d]/g, '')}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value ? `${e.target.value} ₺/adet` : '' }))}
                      placeholder="1250"
                      className="w-full rounded-l-lg border border-r-0 border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                    />
                    <span className="inline-flex items-center rounded-r-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                      ₺/adet
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Koleksiyon *
                  </label>
                  <select
                    value={newProduct.collection}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, collection: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  >
                    <option value="aslan">Aslan</option>
                    <option value="ottoman">Ottoman</option>
                  </select>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Alt Başlık
                  </label>
                  <input
                    type="text"
                    value={newProduct.subtitle}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Kırmızı/Altın · Red/Gold"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ürün Tipi
                  </label>
                  <input
                    type="text"
                    list="productTypes"
                    value={newProduct.product_type}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, product_type: e.target.value }))}
                    placeholder="Tabak, Fincan, Kupa..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                  <datalist id="productTypes">
                    {existingValues.productTypes.map(type => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Malzeme
                  </label>
                  <input
                    type="text"
                    list="materials"
                    value={newProduct.material}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="Porselen"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                  <datalist id="materials">
                    {existingValues.materials.map(mat => (
                      <option key={mat} value={mat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Renk
                  </label>
                  <input
                    type="text"
                    list="colors"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Kırmızı/Altın"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                  <datalist id="colors">
                    {existingValues.colors.map(color => (
                      <option key={color} value={color} />
                    ))}
                  </datalist>
                </div>

                {/* Boyut - always visible */}
                {fieldVisibility.showSize && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Boyut
                    </label>
                    <input
                      type="text"
                      list="sizes"
                      value={newProduct.size}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="Ø21cm, 25x30cm..."
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                    />
                    <datalist id="sizes">
                      {existingValues.sizes.map(size => (
                        <option key={size} value={size} />
                      ))}
                    </datalist>
                  </div>
                )}

                {/* Kapasite - only for cups, mugs, sets */}
                {fieldVisibility.showCapacity && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Kapasite
                      <span className="ml-1 text-xs text-gray-400">(Fincan/Kupa/Set için)</span>
                    </label>
                    <input
                      type="text"
                      list="capacities"
                      value={newProduct.capacity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="150ml, 250ml..."
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                    />
                    <datalist id="capacities">
                      {existingValues.capacities.map(cap => (
                        <option key={cap} value={cap} />
                      ))}
                    </datalist>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ürün Kodu
                  </label>
                  <input
                    type="text"
                    value={newProduct.code}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="20231500061"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Aile
                  </label>
                  <input
                    type="text"
                    list="families"
                    value={newProduct.family}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, family: e.target.value }))}
                    placeholder="ASLAN, OTTOMAN..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                  <datalist id="families">
                    {existingValues.families.map(fam => (
                      <option key={fam} value={fam} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ürün Resimleri
                </label>

                {/* Uploaded Images Preview */}
                {newProduct.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {newProduct.images.map((url, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={url}
                          alt={`Ürün resmi ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-[#0f3f44] hover:text-[#0f3f44]">
                  {uploadingImage ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      Resim Yükle (Maks 4MB)
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {/* Manual URL Input (collapsed) */}
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                    veya manuel URL girin
                  </summary>
                  <textarea
                    value={newProduct.images.join('\n')}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      images: e.target.value.split('\n').filter(url => url.trim())
                    }))}
                    placeholder="/images/products/urun1.jpg"
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-[#0f3f44] focus:outline-none"
                  />
                </details>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <span className="text-sm font-medium text-gray-700">Stokta</span>
                <button
                  onClick={() => setNewProduct(prev => ({ ...prev, in_stock: !prev.in_stock }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newProduct.in_stock ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      newProduct.in_stock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={saveProduct}
                disabled={savingProduct || !newProduct.title || !newProduct.price}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-3 text-sm font-medium text-white hover:bg-[#0a2a2e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProduct ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {editingProductId ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingProductId ? 'Güncelle' : 'Ürünü Kaydet'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Ürünü Sil</h3>
            </div>
            <p className="mb-6 text-gray-600">
              Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deletingProduct}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={deletingProduct}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingProduct ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Evet, Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
