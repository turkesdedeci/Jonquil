import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useStock } from "@/contexts/StockContext";

// Helper function to derive subcategory from product title
function getSubCategory(title: string): string | null {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('pasta tabağı') || lowerTitle.includes('cake plate')) return 'Pasta Tabağı';
  if (lowerTitle.includes('servis tabağı') || lowerTitle.includes('serving plate')) return 'Servis Tabağı';
  if (lowerTitle.includes('kase') || lowerTitle.includes('bowl')) return 'Kase';
  if (lowerTitle.includes('fincan') || lowerTitle.includes('cup')) return 'Fincan';
  if (lowerTitle.includes('kupa') || lowerTitle.includes('mug')) return 'Kupa';
  if (lowerTitle.includes('küllük') || lowerTitle.includes('ashtray')) return 'Küllük';
  if (lowerTitle.includes('mumluk') || lowerTitle.includes('candle')) return 'Mumluk';
  if (lowerTitle.includes('yastık') || lowerTitle.includes('pillow') || lowerTitle.includes('cushion')) return 'Yastık';
  if (lowerTitle.includes('tepsi') || lowerTitle.includes('tray')) return 'Tepsi';
  if (lowerTitle.includes('kutu') || lowerTitle.includes('box')) return 'Kutu';
  return null;
}

// Luxury badge component
export function LuxuryBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-[#d4af7a]/30 bg-[#faf8f5]/80 px-4 py-2 backdrop-blur-sm">
      <div className="text-[#d4af7a]">{icon}</div>
      <span className="text-xs font-medium tracking-wide text-[#2a2a2a]">{text}</span>
    </div>
  );
}

// Feature card
// components/Cards.tsx

export function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[#e8e6e3] bg-white p-8 transition-all hover:shadow-xl">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf8f5] text-[#0f3f44] transition-colors group-hover:bg-[#0f3f44] group-hover:text-white">
        {/* DEĞİŞİKLİK: <Icon /> yerine doğrudan {icon} kullanıyoruz */}
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[#1a1a1a]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#666]">{desc}</p>
    </div>
  );
}
// Collection card
export function CollectionCard({
  image,
  badge,
  title,
  desc,
  onClick
}: {
  image: string;
  badge: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:shadow-2xl"
      role="button"
      tabIndex={0}
      aria-label={`${title} koleksiyonunu görüntüle`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="mb-3 text-xs font-light uppercase tracking-[0.2em] text-[#d4af7a]">{badge}</div>
        <h3 className="text-2xl font-light tracking-wide">{title}</h3>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
          <span>Koleksiyonu Keşfet</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
}

// Simple Product card (no grouping)
export function ProductCard({
  product,
  onClick
}: {
  product: any;
  onClick: () => void;
}) {
  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const { isInStock } = useStock();

  // Check stock status
  const inStock = isInStock(product.id);

  // Safely get images with fallbacks
  const images = product.images || ["/placeholder.jpg"];

  // Image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-xl ${
        inStock ? 'border-[#e8e6e3]' : 'border-red-200'
      }`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`${product.title}${!inStock ? ' - Stokta yok' : ''}, ${product.price}`}
    >
      {/* Product Image */}
      <div className={`relative aspect-square overflow-hidden bg-[#faf8f5] ${!inStock ? 'grayscale' : ''}`}>
        {images.map((img: string, idx: number) => (
          <Image
            key={idx}
            src={img || "/placeholder.jpg"}
            alt={`${product.title} - Görsel ${idx + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${
              idx === currentImgIndex ? "opacity-100" : "opacity-0"
            } ${!inStock && idx === currentImgIndex ? 'opacity-60' : ''}`}
            loading={idx === 0 ? "eager" : "lazy"}
            priority={idx === 0}
          />
        ))}

        {/* Image Navigation Arrows (if multiple images) */}
        {images.length > 1 && inStock && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0f3f44] opacity-100 shadow-md backdrop-blur-sm transition-all hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0f3f44] opacity-100 shadow-md backdrop-blur-sm transition-all hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Material Badge & Out of Stock Badge */}
        <div className="absolute left-3 top-3 flex gap-2">
          <div className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0f3f44] shadow-sm backdrop-blur-sm">
            {product.material}
          </div>
          {!inStock && (
            <div className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
              Tükendi
            </div>
          )}
        </div>

        {/* Size Badge */}
        {product.size && (
          <div className="absolute right-3 top-3 rounded-full bg-[#0f3f44]/90 px-3 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
            {product.size}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-light uppercase tracking-wider text-[#999]">
            {product.family}
          </span>
          {getSubCategory(product.title) && (
            <span className="text-[10px] font-medium text-[#d4af7a]">
              {getSubCategory(product.title)}
            </span>
          )}
        </div>
        <h3 className={`mb-2 line-clamp-2 text-sm font-medium leading-snug ${inStock ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
          {product.title}
        </h3>

        <div className={`text-base font-semibold ${inStock ? 'text-[#0f3f44]' : 'text-gray-400 line-through'}`}>
          {product.price}
        </div>
      </div>
    </motion.div>
  );
}
