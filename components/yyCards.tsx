import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // AnimatePresence buraya eklendi
import { 
  ArrowRight, 
  BadgeCheck, 
  ShieldCheck, 
  Gift, 
  Truck, 
  ChevronLeft, // İkon eklendi
  ChevronRight // İkon eklendi
} from "lucide-react";
import { BRAND, ASSETS } from "@/constants/brand";

// Luxury badge component
export function LuxuryBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-[#d4af7a]/30 bg-[#faf8f5]/80 px-4 py-2 backdrop-blur-sm">
      <div className="text-[#d4af7a]">{icon}</div>
      <span className="text-xs font-medium tracking-wide text-[#2a2a2a]">{text}</span>
    </div>
  );
}

// Feature card with icon
export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[#e8e6e3] bg-white p-8 shadow-[0_8px_30px_rgba(15,63,68,0.08)] transition-all hover:shadow-[0_20px_60px_rgba(15,63,68,0.12)]">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f3f44] to-[#0a2a2e] text-[#d4af7a]">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[#1a1a1a]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#666]">{description}</p>
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-[#d4af7a]/10 blur-2xl transition-transform group-hover:scale-150" />
    </div>
  );
}

// Collection card for homepage
export function CollectionCard({
  title,
  subtitle,
  image,
  onClick,
}: {
  title: string;
  subtitle: string;
  image: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      onClick={onClick}
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="mb-1 text-xs font-light tracking-widest opacity-90">{subtitle}</div>
        <h3 className="text-2xl font-light tracking-wide">{title}</h3>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
          <span>Koleksiyonu Keşfet</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
}

// Product card
export function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  const [currentImg, setCurrentImg] = React.useState(0);
  const images = product.images || [product.image || ASSETS.hero];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-sm transition-all hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-[#faf8f5]">
        {/* Görsel */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImg}
            src={images[currentImg]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Eğer birden fazla resim varsa okları göster */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev === 0 ? images.length - 1 : prev - 1)); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#0f3f44] backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev === images.length - 1 ? 0 : prev + 1)); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#0f3f44] backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Alt bilgiler aynı kalıyor */}
      <div className="p-5">
        <div className="mb-1 text-xs font-light text-[#999]">{product.family}</div>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-[#1a1a1a]">{product.title}</h3>
        <div className="text-base font-semibold text-[#0f3f44]">{product.price}</div>
      </div>
    </motion.div>
  );
}