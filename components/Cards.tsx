import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:shadow-2xl"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="mb-3 text-xs font-light uppercase tracking-[0.2em] text-[#d4af7a]">{badge}</div>
        <h3 className="text-2xl font-light tracking-wide">{title}</h3>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
          <span>Koleksiyonu Keşfet</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-sm transition-all hover:shadow-xl"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#faf8f5]">
        {images.map((img: string, idx: number) => (
          <Image
            key={idx}
            src={img || "/placeholder.jpg"}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${
              idx === currentImgIndex ? "opacity-100" : "opacity-0"
            }`}
            loading={idx === 0 ? "eager" : "lazy"}
            priority={idx === 0}
          />
        ))}

        {/* Image Navigation Arrows (if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0f3f44] opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0f3f44] opacity-0 shadow-md backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Material Badge */}
        <div className="absolute left-3 top-3">
          <div className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0f3f44] shadow-sm backdrop-blur-sm">
            {product.material}
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-5">
        <div className="mb-1 text-xs font-light uppercase tracking-wider text-[#999]">
          {product.family}
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-[#1a1a1a]">
          {product.title}
        </h3>
        
        <div className="text-base font-semibold text-[#0f3f44]">
          {product.price}
        </div>
      </div>
    </motion.div>
  );
}