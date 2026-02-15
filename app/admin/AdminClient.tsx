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
  ImagePlus,
  Edit2,
  AlertTriangle,
  Database,
  ArrowUp,
  ArrowDown,
  Crop
} from 'lucide-react';
import { allProducts } from '@/data/products';

interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  user_email?: string;
  customer_email?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  payment_method?: string;
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
  product_id?: string;
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
const CROP_BOX_SIZE = 320;
const CROP_MAX_ZOOM = 2.5;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EMPTY_PRODUCT = {
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
  in_stock: true,
  stock_quantity: 0,
  low_stock_threshold: 5
};

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('aria-hidden')
  );

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderCustomerFilter, setOrderCustomerFilter] = useState<'all' | 'guest' | 'registered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingModal, setTrackingModal] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>({});
  const [stockDetails, setStockDetails] = useState<Record<string, { in_stock: boolean; stock_quantity: number | null; low_stock_threshold: number | null }>>({});
  const [productOverrides, setProductOverrides] = useState<Record<string, any>>({});
  const [stockEdits, setStockEdits] = useState<Record<string, { stock_quantity: number; low_stock_threshold: number }>>({});
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [stockTableExists, setStockTableExists] = useState(true);
  const [settingUpTable, setSettingUpTable] = useState(false);
  const [setupMessage, setSetupMessage] = useState<{type: 'success' | 'error' | 'info', text: string, sql?: string} | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const getCustomerName = (order: Order) => {
    const name = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim();
    if (name) return name;
    const email = order.user_email || order.customer_email;
    if (email) return email.split('@')[0];
    return 'Müşteri';
  };

  const getCustomerEmail = (order: Order) => {
    return order.user_email || order.customer_email || '';
  };

  // New product states
  const [showProductModal, setShowProductModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [productFormMessage, setProductFormMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);
  const [cropTarget, setCropTarget] = useState<{ index: number; src: string } | null>(null);
  const [cropSourceSize, setCropSourceSize] = useState<{ width: number; height: number } | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [croppingImage, setCroppingImage] = useState(false);
  const orderDialogRef = useRef<HTMLDivElement>(null);
  const trackingDialogRef = useRef<HTMLDivElement>(null);
  const productDialogRef = useRef<HTMLDivElement>(null);
  const cropDialogRef = useRef<HTMLDivElement>(null);
  const deleteDialogRef = useRef<HTMLDivElement>(null);
  const cropDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);
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
    in_stock: true,
    stock_quantity: 0,
    low_stock_threshold: 5
  });

  const normalizeImageSrc = (src?: string) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('/')) return src;
    return `/${src}`;
  };

  const compressImage = async (file: File, maxBytes = 4 * 1024 * 1024, maxDimension = 2600) => {
    if (!file.type.startsWith('image/')) return file;
    if (file.type === 'image/gif') return file;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Resim okunamadı'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = document.createElement('img');
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Resim yüklenemedi'));
      image.src = dataUrl;
    });

    const longestEdge = Math.max(img.width, img.height);
    if (file.size <= maxBytes && longestEdge <= maxDimension) {
      return file;
    }

    const scale = Math.min(1, maxDimension / longestEdge);
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    const preferredType =
      file.type === 'image/png' && file.size > maxBytes
        ? 'image/jpeg'
        : file.type;
    if (preferredType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    let quality = preferredType === 'image/webp' ? 0.9 : 0.92;
    const minQuality = 0.65;

    const toBlob = (q: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, preferredType, q));

    let blob = await toBlob(quality);
    while (blob && blob.size > maxBytes && quality > minQuality) {
      quality -= 0.05;
      blob = await toBlob(quality);
    }

    if (!blob || blob.size > maxBytes) return file;

    const extByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extByType[preferredType] || 'jpg';
    const name = file.name.replace(/\.[^/.]+$/, `.${ext}`);
    return new File([blob], name, { type: preferredType });
  };

  const clampValue = (value: number, min: number, max: number) => {
    if (min > max) return min;
    return Math.min(max, Math.max(min, value));
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const uploadImageFile = async (file: File) => {
    const optimizedFile = await compressImage(file);
    const formData = new FormData();
    formData.append('file', optimizedFile);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'Yükleme hatası');
    }

    const data = await res.json();
    if (!data?.url) {
      throw new Error('Yüklenen görsel URL alınamadı');
    }

    return data.url as string;
  };

  const loadImageElement = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = document.createElement('img');
      const normalizedSrc = normalizeImageSrc(src);

      if (normalizedSrc.startsWith('http://') || normalizedSrc.startsWith('https://')) {
        try {
          const origin = new URL(normalizedSrc).origin;
          if (origin !== window.location.origin) {
            image.crossOrigin = 'anonymous';
          }
        } catch {
          // ignore malformed urls
        }
      }

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Görsel yüklenemedi'));
      image.src = normalizedSrc;
    });

  const closeCropModal = useCallback(() => {
    setCropTarget(null);
    setCropSourceSize(null);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCroppingImage(false);
    cropDragRef.current = null;
  }, []);

  const closeOrderDialog = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const closeTrackingDialog = useCallback(() => {
    setTrackingModal(null);
  }, []);

  const closeProductDialog = useCallback(() => {
    setShowProductModal(false);
    setProductFormMessage(null);
    setEditingProductId(null);
    setNewProduct(EMPTY_PRODUCT);
    closeCropModal();
  }, [closeCropModal]);

  const closeDeleteDialog = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  useEffect(() => {
    const activeModal =
      (cropTarget && { ref: cropDialogRef, close: closeCropModal }) ||
      (deleteConfirmId && { ref: deleteDialogRef, close: closeDeleteDialog }) ||
      (showProductModal && { ref: productDialogRef, close: closeProductDialog }) ||
      (trackingModal && { ref: trackingDialogRef, close: closeTrackingDialog }) ||
      (selectedOrder && { ref: orderDialogRef, close: closeOrderDialog }) ||
      null;

    if (!activeModal) return;

    const container = activeModal.ref.current;
    if (!container) return;

    const previousFocusedElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      const focusable = getFocusableElements(container);
      (focusable[0] || container).focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        activeModal.close();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusedElement?.focus();
    };
  }, [
    cropTarget,
    deleteConfirmId,
    selectedOrder,
    showProductModal,
    trackingModal,
    closeCropModal,
    closeDeleteDialog,
    closeOrderDialog,
    closeProductDialog,
    closeTrackingDialog,
  ]);

  const cropPreviewMetrics = useMemo(() => {
    if (!cropSourceSize?.width || !cropSourceSize?.height) return null;

    const baseScale = Math.max(CROP_BOX_SIZE / cropSourceSize.width, CROP_BOX_SIZE / cropSourceSize.height);
    const scale = baseScale * cropZoom;
    const renderedWidth = cropSourceSize.width * scale;
    const renderedHeight = cropSourceSize.height * scale;
    const maxOffsetX = Math.max(0, (renderedWidth - CROP_BOX_SIZE) / 2);
    const maxOffsetY = Math.max(0, (renderedHeight - CROP_BOX_SIZE) / 2);

    return {
      scale,
      renderedWidth,
      renderedHeight,
      maxOffsetX,
      maxOffsetY,
    };
  }, [cropSourceSize, cropZoom]);

  useEffect(() => {
    if (!cropPreviewMetrics) return;
    setCropOffset((prev) => ({
      x: clampValue(prev.x, -cropPreviewMetrics.maxOffsetX, cropPreviewMetrics.maxOffsetX),
      y: clampValue(prev.y, -cropPreviewMetrics.maxOffsetY, cropPreviewMetrics.maxOffsetY),
    }));
  }, [cropPreviewMetrics]);

  const openCropModal = async (index: number, src: string) => {
    setProductFormMessage(null);
    setCropTarget({ index, src });
    setCropSourceSize(null);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });

    try {
      const image = await loadImageElement(src);
      setCropSourceSize({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    } catch (error: unknown) {
      closeCropModal();
      setProductFormMessage({
        type: 'error',
        text: getErrorMessage(error, 'Kırpma için görsel açılamadı'),
      });
    }
  };

  const handleCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cropPreviewMetrics || croppingImage) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    cropDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: cropOffset.x,
      startOffsetY: cropOffset.y,
    };
  };

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = cropDragRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId || !cropPreviewMetrics || croppingImage) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    setCropOffset({
      x: clampValue(dragState.startOffsetX + deltaX, -cropPreviewMetrics.maxOffsetX, cropPreviewMetrics.maxOffsetX),
      y: clampValue(dragState.startOffsetY + deltaY, -cropPreviewMetrics.maxOffsetY, cropPreviewMetrics.maxOffsetY),
    });
  };

  const handleCropPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = cropDragRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    cropDragRef.current = null;
  };

  const applyImageCrop = async () => {
    if (!cropTarget || !cropSourceSize || !cropPreviewMetrics) return;

    setCroppingImage(true);
    setProductFormMessage(null);

    try {
      const sourceImage = await loadImageElement(cropTarget.src);

      const imageLeft = (CROP_BOX_SIZE - cropPreviewMetrics.renderedWidth) / 2 + cropOffset.x;
      const imageTop = (CROP_BOX_SIZE - cropPreviewMetrics.renderedHeight) / 2 + cropOffset.y;
      const sourceWidth = CROP_BOX_SIZE / cropPreviewMetrics.scale;
      const sourceHeight = CROP_BOX_SIZE / cropPreviewMetrics.scale;

      const safeSourceWidth = Math.min(sourceWidth, cropSourceSize.width);
      const safeSourceHeight = Math.min(sourceHeight, cropSourceSize.height);

      const sourceX = clampValue(
        (0 - imageLeft) / cropPreviewMetrics.scale,
        0,
        Math.max(0, cropSourceSize.width - safeSourceWidth)
      );
      const sourceY = clampValue(
        (0 - imageTop) / cropPreviewMetrics.scale,
        0,
        Math.max(0, cropSourceSize.height - safeSourceHeight)
      );

      const canvas = document.createElement('canvas');
      const outputSize = 1200;
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Kırpma işlemi başlatılamadı');
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputSize, outputSize);
      ctx.drawImage(
        sourceImage,
        sourceX,
        sourceY,
        safeSourceWidth,
        safeSourceHeight,
        0,
        0,
        outputSize,
        outputSize
      );

      const croppedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!croppedBlob) {
        throw new Error('Kırpılan görsel üretilemedi');
      }

      const croppedFile = new File([croppedBlob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const uploadedUrl = await uploadImageFile(croppedFile);
      const targetIndex = cropTarget.index;

      setNewProduct((prev) => {
        if (targetIndex < 0 || targetIndex >= prev.images.length) return prev;
        const nextImages = [...prev.images];
        nextImages[targetIndex] = uploadedUrl;
        return { ...prev, images: nextImages };
      });

      closeCropModal();
      setProductFormMessage({ type: 'success', text: 'Görsel kırpıldı ve güncellendi' });
    } catch (error: unknown) {
      setProductFormMessage({
        type: 'error',
        text: getErrorMessage(error, 'Görsel kırpılamadı'),
      });
      setCroppingImage(false);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setNewProduct((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.images.length ||
        toIndex >= prev.images.length
      ) {
        return prev;
      }

      const nextImages = [...prev.images];
      const [moved] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, moved);
      return { ...prev, images: nextImages };
    });
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverImageIndex !== index) {
      setDragOverImageIndex(index);
    }
  };

  const handleImageDrop = (index: number) => {
    if (draggingImageIndex === null) return;
    moveImage(draggingImageIndex, index);
    setDraggingImageIndex(null);
    setDragOverImageIndex(null);
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
        const uploadedUrl = await uploadImageFile(file);
        uploadedUrls.push(uploadedUrl);
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

    setCropTarget((prev) => {
      if (!prev) return prev;
      if (prev.index === index) return null;
      if (prev.index > index) return { ...prev, index: prev.index - 1 };
      return prev;
    });
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
    const applyOverrides = (product: any) => {
      const override = productOverrides[product.id];
      if (!override) return product;
      return {
        ...product,
        ...override,
        productType: override.product_type || product.productType || product.product_type,
        setSingle: override.set_single || product.setSingle || product.set_single,
      };
    };

    // Transform dbProducts to match allProducts format
    const transformedDbProducts = dbProducts.map(p => applyOverrides({
      ...p,
      productType: p.product_type,
      setSingle: p.set_single,
      isFromDatabase: true,
    }));

    const transformedStatic = allProducts.map(p => applyOverrides(p));

    return [...transformedDbProducts, ...transformedStatic];
  }, [dbProducts, productOverrides]);

  const topSellingProducts = useMemo(() => {
    const counts = new Map<string, { qty: number; revenue: number }>();
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const itemKey = item.product_id || item.id;
        const current = counts.get(itemKey) || { qty: 0, revenue: 0 };
        const qty = item.quantity || 0;
        const revenue = item.total_price || 0;
        counts.set(itemKey, { qty: current.qty + qty, revenue: current.revenue + revenue });
      });
    });
    const productMap = new Map(allCombinedProducts.map(p => [p.id, p]));
    return Array.from(counts.entries())
      .map(([id, data]) => ({
        id,
        qty: data.qty,
        revenue: data.revenue,
        title: productMap.get(id)?.title || id,
        collection: productMap.get(id)?.collection || '',
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders, allCombinedProducts]);

  const outOfStockProducts = useMemo(() => {
    return allCombinedProducts
      .filter(p => (stockDetails[p.id]?.in_stock ?? stockStatus[p.id]) === false)
      .slice(0, 5);
  }, [allCombinedProducts, stockStatus, stockDetails]);
  
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
        const overridesMap: Record<string, any> = {};
        (data.overrides || []).forEach((item: any) => {
          overridesMap[item.product_id] = item;
        });
        setProductOverrides(overridesMap);
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
        setStockDetails(data.stockDetails || {});
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

        const stockRes = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: editingProductId || data.product?.id,
            inStock: newProduct.in_stock !== false,
            stockQuantity: Number.isFinite(Number(newProduct.stock_quantity)) ? Number(newProduct.stock_quantity) : 0,
            lowStockThreshold: Number.isFinite(Number(newProduct.low_stock_threshold)) ? Number(newProduct.low_stock_threshold) : 5,
          }),
        });

        if (!stockRes.ok) {
          const stockData = await stockRes.json().catch(() => ({}));
          setProductFormMessage({ type: 'error', text: stockData.error || 'Stok bilgisi kaydedilemedi' });
        } else {
          await loadDbProducts();
          await loadStockStatus();
        }

        setTimeout(() => {
          closeProductDialog();
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
    closeCropModal();
    const override = productOverrides[product.id] || {};
    const stockInfo = stockDetails[product.id];
    setEditingProductId(product.id);
    setNewProduct({
      title: override.title || product.title || '',
      subtitle: override.subtitle || product.subtitle || '',
      price: override.price || product.price || '',
      collection: override.collection || product.collection || 'aslan',
      family: override.family || product.family || '',
      product_type: override.product_type || product.product_type || product.productType || '',
      material: override.material || product.material || 'Porselen',
      color: override.color || product.color || '',
      size: override.size || product.size || '',
      capacity: override.capacity || product.capacity || '',
      code: override.code || product.code || '',
      images: override.images || product.images || [],
      in_stock: stockInfo?.in_stock ?? product.in_stock !== false,
      stock_quantity: stockInfo?.stock_quantity ?? 0,
      low_stock_threshold: stockInfo?.low_stock_threshold ?? 5
    });
    setShowProductModal(true);
  };

  // Open new product modal
  const openNewProductModal = () => {
    closeCropModal();
    setEditingProductId(null);
    setNewProduct(EMPTY_PRODUCT);
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
    const currentStatus = (stockDetails[productId]?.in_stock ?? stockStatus[productId]) !== false; // Default true (in stock)
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
        setStockDetails(prev => ({
          ...prev,
          [productId]: {
            in_stock: newStatus,
            stock_quantity: prev[productId]?.stock_quantity ?? null,
            low_stock_threshold: prev[productId]?.low_stock_threshold ?? null,
          }
        }));
      }
    } catch (error) {
      console.error('Stok durumu güncellenirken hata:', error);
    } finally {
      setUpdatingStock(null);
    }
  };

  const updateStockDetails = async (productId: string) => {
    const current = stockDetails[productId];
    const editValues = stockEdits[productId] || {
      stock_quantity: current?.stock_quantity ?? 0,
      low_stock_threshold: current?.low_stock_threshold ?? 5,
    };

    setUpdatingStock(productId);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          stockQuantity: Number.isFinite(Number(editValues.stock_quantity)) ? Number(editValues.stock_quantity) : 0,
          lowStockThreshold: Number.isFinite(Number(editValues.low_stock_threshold)) ? Number(editValues.low_stock_threshold) : 5,
        }),
      });

      if (res.ok) {
        const shouldBeInStock = editValues.stock_quantity > 0;
        setStockDetails(prev => ({
          ...prev,
          [productId]: {
            in_stock: shouldBeInStock,
            stock_quantity: editValues.stock_quantity,
            low_stock_threshold: editValues.low_stock_threshold,
          }
        }));
        setStockStatus(prev => ({ ...prev, [productId]: shouldBeInStock }));
        setStockEdits(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    } catch (error) {
      console.error('Stok bilgisi güncellenirken hata:', error);
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
      ['Sipariş No', 'Tarih', 'Müşteri', 'Email', 'Durum', 'Toplam', 'Misafir'].join(','),
      ...filteredOrders.map(o => [
        o.order_number,
        new Date(o.created_at).toLocaleDateString('tr-TR'),
        `${o.customer_first_name || ''} ${o.customer_last_name || ''}`.trim(),
        o.user_email || '',
        statusConfig[o.status].label,
        o.total_amount,
        !o.user_id ? 'Evet' : 'Hayır'
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
      orderCustomerFilter === 'all' ||
      (orderCustomerFilter === 'guest' ? !order.user_id : !!order.user_id)
    )
    .filter(order =>
      searchTerm === '' ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user_email || order.customer_email)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

              <div>
                <select
                  value={orderCustomerFilter}
                  onChange={(e) => setOrderCustomerFilter(e.target.value as 'all' | 'guest' | 'registered')}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                >
                  <option value="all">Tüm Müşteriler</option>
                  <option value="guest">Sadece Misafir</option>
                  <option value="registered">Sadece Üyeler</option>
                </select>
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
                                  {getCustomerName(order)}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-500">{getCustomerEmail(order) || '—'}</p>
                                  {!order.user_id && (
                                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                      Misafir
                                    </span>
                                  )}
                                </div>
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
                  {allCombinedProducts.filter(p => (stockDetails[p.id]?.in_stock ?? stockStatus[p.id]) !== false).length}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Tükendi</p>
                <p className="text-2xl font-bold text-red-600">
                  {allCombinedProducts.filter(p => (stockDetails[p.id]?.in_stock ?? stockStatus[p.id]) === false).length}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Koleksiyonlar</p>
                <p className="text-2xl font-bold text-purple-600">2</p>
              </div>
            </div>

            {/* Ürün Uyarıları ve En Çok Satanlar */}
            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">En Çok Satanlar</p>
                  <span className="text-xs text-gray-400">Son siparişlere göre</span>
                </div>
                {topSellingProducts.length === 0 ? (
                  <p className="text-sm text-gray-500">Henüz satış yok</p>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {topSellingProducts.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="truncate">{item.title}</span>
                        <span className="text-xs text-gray-500">{item.qty} adet</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Tükenen Ürünler</p>
                  <span className="text-xs text-gray-400">Stok dışı</span>
                </div>
                {outOfStockProducts.length === 0 ? (
                  <p className="text-sm text-gray-500">Tükenen ürün yok</p>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {outOfStockProducts.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="truncate">{item.title}</span>
                        <span className="text-xs text-red-500">Tükendi</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Ürün Listesi */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const stockInfo = stockDetails[product.id];
                const isInStock = (stockInfo?.in_stock ?? stockStatus[product.id]) !== false;
                const stockQuantity = stockInfo?.stock_quantity;
                const lowStockThreshold = stockInfo?.low_stock_threshold;
                const isLowStock = typeof stockQuantity === 'number'
                  && typeof lowStockThreshold === 'number'
                  && stockQuantity > 0
                  && stockQuantity <= lowStockThreshold;
                const isUpdating = updatingStock === product.id;
                const editValues = stockEdits[product.id] || {
                  stock_quantity: stockQuantity ?? 0,
                  low_stock_threshold: lowStockThreshold ?? 5,
                };
                const imageSrc = normalizeImageSrc(product.images?.[0]);

                return (
                  <div
                    key={product.id}
                    className={`overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md ${
                      isInStock ? 'border-gray-200' : 'border-red-200'
                    }`}
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {imageSrc && (
                        <Image
                          src={imageSrc}
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
                        {isLowStock && isInStock && (
                          <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                            Düşük Stok
                          </span>
                        )}
                      </div>
                      {/* Edit/Delete buttons */}
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm hover:bg-white hover:text-blue-600"
                          title="Düzenle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {product.isFromDatabase && (
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm hover:bg-white hover:text-red-600"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
                      <div className="mt-2 text-xs text-gray-500">
                        Stok: {stockQuantity ?? 0} · Eşik: {lowStockThreshold ?? 5}
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min={0}
                          value={editValues.stock_quantity}
                          onChange={(e) => setStockEdits(prev => ({
                            ...prev,
                            [product.id]: {
                              stock_quantity: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0,
                              low_stock_threshold: editValues.low_stock_threshold,
                            }
                          }))}
                          className="col-span-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-[#0f3f44] focus:outline-none"
                          placeholder="Stok"
                          aria-label="Stok miktarı"
                        />
                        <input
                          type="number"
                          min={0}
                          value={editValues.low_stock_threshold}
                          onChange={(e) => setStockEdits(prev => ({
                            ...prev,
                            [product.id]: {
                              stock_quantity: editValues.stock_quantity,
                              low_stock_threshold: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 5,
                            }
                          }))}
                          className="col-span-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-[#0f3f44] focus:outline-none"
                          placeholder="Eşik"
                          aria-label="Düşük stok eşiği"
                        />
                        <button
                          onClick={() => updateStockDetails(product.id)}
                          disabled={isUpdating}
                          className="col-span-1 rounded-md bg-[#0f3f44] px-2 py-1 text-xs font-medium text-white hover:bg-[#0a2a2e] disabled:opacity-50"
                        >
                          Kaydet
                        </button>
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
          <div
            ref={orderDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-detail-title"
            tabIndex={-1}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
              <div>
                <h2 id="admin-order-detail-title" className="text-lg font-bold text-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={closeOrderDialog}
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
                    {getCustomerName(selectedOrder)}
                  </p>
                  <p className="text-sm text-gray-600">{getCustomerEmail(selectedOrder) || '—'}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                  )}
                  {selectedOrder.payment_method && (
                    <p className="text-sm text-gray-600">
                      Ödeme Yöntemi: {selectedOrder.payment_method === 'bank' ? 'Havale/EFT' : 'Kredi/Banka Kartı'}
                    </p>
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
          <div
            ref={trackingDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-tracking-dialog-title"
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="admin-tracking-dialog-title" className="text-lg font-bold text-gray-900">Kargo Bilgisi Ekle</h2>
              <button
                onClick={closeTrackingDialog}
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
          <div
            ref={productDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-product-dialog-title"
            tabIndex={-1}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
              <h2 id="admin-product-dialog-title" className="text-lg font-bold text-gray-900">
                {editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <button
                onClick={closeProductDialog}
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
                  <div className="mb-3">
                    <div className="mb-2 text-xs text-gray-500">
                      Sürükle-bırak ile sıralayın. İlk görsel vitrin görseli olarak kullanılır.
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {newProduct.images.map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className={`group relative aspect-square overflow-hidden rounded-lg border bg-gray-100 ${
                          dragOverImageIndex === idx ? 'border-[#0f3f44] ring-2 ring-[#0f3f44]/20' : 'border-transparent'
                        }`}
                        draggable
                        onDragStart={() => setDraggingImageIndex(idx)}
                        onDragOver={(e) => handleImageDragOver(e, idx)}
                        onDrop={() => handleImageDrop(idx)}
                        onDragEnd={() => {
                          setDraggingImageIndex(null);
                          setDragOverImageIndex(null);
                        }}
                      >
                        <Image
                          src={url}
                          alt={`Ürün resmi ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        <span className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {idx + 1}
                        </span>
                        <div className="absolute inset-x-1 bottom-1 grid grid-cols-2 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, Math.max(0, idx - 1))}
                            disabled={idx === 0}
                            className="flex items-center justify-center rounded-md bg-white/90 py-1 text-gray-700 shadow disabled:cursor-not-allowed disabled:opacity-40"
                            title="Öne taşı"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, Math.min(newProduct.images.length - 1, idx + 1))}
                            disabled={idx === newProduct.images.length - 1}
                            className="flex items-center justify-center rounded-md bg-white/90 py-1 text-gray-700 shadow disabled:cursor-not-allowed disabled:opacity-40"
                            title="Sona taşı"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => openCropModal(idx, url)}
                          className="absolute left-1 top-8 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#0f3f44] shadow-sm opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                          title="Kırp"
                        >
                          <Crop className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                          title="Sil"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    </div>
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
              <div className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Stok Miktarı
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      stock_quantity: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0
                    }))}
                    placeholder="Örn: 25"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Düşük Stok Eşiği
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newProduct.low_stock_threshold}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      low_stock_threshold: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 5
                    }))}
                    placeholder="Örn: 5"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#0f3f44] focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 sm:col-span-2">
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

      {/* Image Crop Modal */}
      {cropTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div
            ref={cropDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-crop-dialog-title"
            tabIndex={-1}
            className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 id="admin-crop-dialog-title" className="text-lg font-bold text-gray-900">Görseli Kırp</h3>
                <p className="text-sm text-gray-500">Sürükleyin veya slider ile konum/zoom ayarlayın.</p>
              </div>
              <button
                type="button"
                onClick={closeCropModal}
                disabled={croppingImage}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                title="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="mx-auto w-full max-w-[360px]">
                <div
                  className="relative mx-auto h-[320px] w-[320px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 touch-none"
                  onPointerDown={handleCropPointerDown}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={handleCropPointerEnd}
                  onPointerCancel={handleCropPointerEnd}
                >
                  {cropPreviewMetrics ? (
                    <Image
                      src={normalizeImageSrc(cropTarget.src)}
                      alt="Kırpma önizleme"
                      width={Math.max(1, cropSourceSize?.width || CROP_BOX_SIZE)}
                      height={Math.max(1, cropSourceSize?.height || CROP_BOX_SIZE)}
                      draggable={false}
                      className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                      style={{
                        width: `${cropPreviewMetrics.renderedWidth}px`,
                        height: `${cropPreviewMetrics.renderedHeight}px`,
                        transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                      Görsel yükleniyor...
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 ring-2 ring-white/80" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-gray-700">
                    <span>Zoom</span>
                    <span className="font-medium">{cropZoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={CROP_MAX_ZOOM}
                    step={0.01}
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    className="w-full"
                    disabled={!cropPreviewMetrics || croppingImage}
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-gray-700">
                    <span>Yatay Konum</span>
                    <span className="font-medium">{Math.round(cropOffset.x)} px</span>
                  </div>
                  <input
                    type="range"
                    min={cropPreviewMetrics ? -cropPreviewMetrics.maxOffsetX : 0}
                    max={cropPreviewMetrics ? cropPreviewMetrics.maxOffsetX : 0}
                    step={1}
                    value={cropOffset.x}
                    onChange={(e) => setCropOffset((prev) => ({ ...prev, x: Number(e.target.value) }))}
                    className="w-full"
                    disabled={!cropPreviewMetrics || croppingImage}
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-gray-700">
                    <span>Dikey Konum</span>
                    <span className="font-medium">{Math.round(cropOffset.y)} px</span>
                  </div>
                  <input
                    type="range"
                    min={cropPreviewMetrics ? -cropPreviewMetrics.maxOffsetY : 0}
                    max={cropPreviewMetrics ? cropPreviewMetrics.maxOffsetY : 0}
                    step={1}
                    value={cropOffset.y}
                    onChange={(e) => setCropOffset((prev) => ({ ...prev, y: Number(e.target.value) }))}
                    className="w-full"
                    disabled={!cropPreviewMetrics || croppingImage}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeCropModal}
                    disabled={croppingImage}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={applyImageCrop}
                    disabled={!cropPreviewMetrics || croppingImage}
                    className="flex items-center gap-2 rounded-lg bg-[#0f3f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2a2e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {croppingImage ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Crop className="h-4 w-4" />
                        Kırp ve Kaydet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={deleteDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-dialog-title"
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 id="admin-delete-dialog-title" className="text-lg font-bold">Ürünü Sil</h3>
            </div>
            <p className="mb-6 text-gray-600">
              Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteDialog}
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
