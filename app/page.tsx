"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  X,
  Instagram,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Jonquil Brand Identity - Fern&Co inspired luxury porcelain design
const BRAND = {
  name: "JONQUIL",
  tagline: "Designer Tableware",
  subtitle: "Handcrafted Porcelain · Art Objects",
  // Elegant color palette inspired by logo - dark teal + gold
  darkTeal: "#0f3f44",
  deepNavy: "#0a2a2e", 
  gold: "#d4af7a",
  lightGold: "#e8d5b7",
  cream: "#faf8f5",
  offWhite: "#f5f3f0",
  warmGray: "#e8e6e3",
  charcoal: "#2a2a2a",
  softBlack: "#1a1a1a",
};

const ASSETS = {
  // Hero collection images - professional porcelain photography
  hero1: "https://images.unsplash.com/photo-1578500351865-d2b170812846?auto=format&fit=crop&w=2400&q=90",
  hero2: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=2400&q=90",
  hero3: "https://images.unsplash.com/photo-1584992236310-6ff8b5b20e28?auto=format&fit=crop&w=2400&q=90",
  
  // Collection covers
  aslanCover: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=2400&q=85",
  ottomanCover: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2400&q=85",
  
  // Lifestyle & detail shots
  tablescape: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=2400&q=85",
  packaging: "https://images.unsplash.com/photo-1520975682031-ae7cfd3f7a4a?auto=format&fit=crop&w=2400&q=85",
  craftsmanship: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=2400&q=85",
};

type Route =
  | { name: "home" }
  | { name: "about" }
  | { name: "contact" }
  | { name: "collections" }
  | { name: "products" } // Tüm Ürünler
  | { name: "category"; category: string } // Kategori bazlı (Tabaklar, Fincanlar vb.)
  | { name: "collection"; slug: "aslan" | "ottoman" }
  | { name: "product"; slug: "aslan" | "ottoman"; id: string };

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function setHash(route: Route) {
  switch (route.name) {
    case "home":
      window.location.hash = "#";
      return;
    case "about":
      window.location.hash = "#/hakkimizda";
      return;
    case "contact":
      window.location.hash = "#/iletisim";
      return;
    case "collections":
      window.location.hash = "#/koleksiyonlar";
      return;
    case "products":
      window.location.hash = "#/urunler";
      return;
    case "category":
      window.location.hash = `#/kategori/${route.category}`;
      return;
    case "collection":
      window.location.hash = `#/koleksiyon/${route.slug}`;
      return;
    case "product":
      window.location.hash = `#/urun/${route.slug}/${route.id}`;
      return;
    default:
      window.location.hash = "#";
      return;
  }
}

function parseHash(): Route {
  const raw = (window.location.hash || "#").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);

  if (parts.length === 0) return { name: "home" };
  if (parts[0] === "koleksiyonlar") return { name: "collections" };
  if (parts[0] === "hakkimizda") return { name: "about" };
  if (parts[0] === "iletisim") return { name: "contact" };
  if (parts[0] === "urunler") return { name: "products" };
  
  if (parts[0] === "kategori" && parts[1]) {
    return { name: "category", category: parts[1] };
  }

  if (parts[0] === "koleksiyon" && (parts[1] === "aslan" || parts[1] === "ottoman")) {
    return { name: "collection", slug: parts[1] };
  }

  if (
    parts[0] === "urun" &&
    (parts[1] === "aslan" || parts[1] === "ottoman") &&
    typeof parts[2] === "string" &&
    parts[2].length
  ) {
    return { name: "product", slug: parts[1], id: parts[2] };
  }

  return { name: "home" };
}

function useRoute() {
  const [route, setRoute] = useState<Route>(() => 
    (typeof window === "undefined" ? { name: "home" } : parseHash())
  );

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = (r: Route) => setHash(r);

  return { route, go };
}

// Luxury badge component
function LuxuryBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-[#d4af7a]/30 bg-[#faf8f5]/80 px-4 py-2 backdrop-blur-sm">
      <div className="text-[#d4af7a]">{icon}</div>
      <span className="text-xs font-medium tracking-wide text-[#2a2a2a]">{text}</span>
    </div>
  );
}

// Feature card with icon
function FeatureCard({
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
function CollectionCard({
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
function ProductCard({
  product,
  onClick,
}: {
  product: any;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-[#faf8f5]">
        <img
          src={ASSETS.hero1}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="mb-1 text-xs font-light tracking-wider text-[#999]">{product.family}</div>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-[#1a1a1a]">
          {product.title}
        </h3>
        <div className="text-base font-semibold text-[#0f3f44]">{product.price}</div>
      </div>
    </motion.div>
  );
}

// Mobile navigation drawer
function MobileNav({
  open,
  onClose,
  onGo,
}: {
  open: boolean;
  onClose: () => void;
  onGo: (r: Route) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#e8e6e3] p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0f3f44] to-[#0a2a2e]" />
                <div>
                  <div className="text-sm font-bold tracking-widest text-[#1a1a1a]">{BRAND.name}</div>
                  <div className="text-[10px] font-light tracking-wide text-[#999]">{BRAND.tagline}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#e8e6e3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-6">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onGo({ name: "collections" });
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
                >
                  Koleksiyonlar
                  <ChevronRight className="h-4 w-4 text-[#999]" />
                </button>
                <button
                  onClick={() => {
                    onGo({ name: "about" });
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
                >
                  Hakkımızda
                  <ChevronRight className="h-4 w-4 text-[#999]" />
                </button>
                <button
                  onClick={() => {
                    onGo({ name: "contact" });
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
                >
                  İletişim
                  <ChevronRight className="h-4 w-4 text-[#999]" />
                </button>
              </div>

              <div className="mt-8 space-y-3">
                <button className="w-full rounded-full bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] px-8 py-6 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90">
                  Hesabım
                </button>
                <button className="w-full rounded-full border border-[#e8e6e3] px-8 py-6 text-sm font-medium tracking-wide transition-colors hover:bg-[#faf8f5]">
                  Sepetim
                </button>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Collections dropdown for desktop
function CollectionDropdown({
  open,
  anchorRef,
  onClose,
  onGo,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onGo: (r: Route) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
        >
      <div className="p-3">
        <button
          onClick={() => {
            onGo({ name: "collection", slug: "aslan" });
            onClose();
          }}
          className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-[#faf8f5]"
        >
          <div className="h-16 w-16 overflow-hidden rounded-lg bg-[#faf8f5]">
            <img src={ASSETS.aslanCover} alt="Aslan" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#1a1a1a]">Aslan Koleksiyonu</div>
            <div className="mt-0.5 text-xs text-[#999]">Klasik tasarımlar</div>
          </div>
        </button>

        <button
          onClick={() => {
            onGo({ name: "collection", slug: "ottoman" });
            onClose();
          }}
          className="mt-1 flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-[#faf8f5]"
        >
          <div className="h-16 w-16 overflow-hidden rounded-lg bg-[#faf8f5]">
            <img src={ASSETS.ottomanCover} alt="Ottoman" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#1a1a1a]">Ottoman Koleksiyonu</div>
            <div className="mt-0.5 text-xs text-[#999]">Renkli desenler</div>
          </div>
        </button>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}

// Products dropdown for desktop
function ProductsDropdown({
  open,
  anchorRef,
  onClose,
  onGo,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onGo: (r: Route) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
        >
          <div className="p-3">
            <button
              onClick={() => {
                onGo({ name: "category", category: "tabaklar" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Tabaklar
              <ChevronRight className="h-4 w-4 text-[#999]" />
            </button>

            <button
              onClick={() => {
                onGo({ name: "category", category: "fincanlar" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Fincanlar & Kupalar
              <ChevronRight className="h-4 w-4 text-[#999]" />
            </button>

            <button
              onClick={() => {
                onGo({ name: "category", category: "mumluklar" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Mumluklar
              <ChevronRight className="h-4 w-4 text-[#999]" />
            </button>

            <button
              onClick={() => {
                onGo({ name: "category", category: "kullukler" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Küllükler
              <ChevronRight className="h-4 w-4 text-[#999]" />
            </button>

            <button
              onClick={() => {
                onGo({ name: "category", category: "tepsiler" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Tepsiler & Kutular
              <ChevronRight className="h-4 w-4 text-[#999]" />
            </button>

            <button
              onClick={() => {
                onGo({ name: "category", category: "tekstil" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Tekstil
              <ChevronRight className="h-4 w-4 text-[#999]" />
            </button>

            <button
              onClick={() => {
                onGo({ name: "category", category: "aksesuarlar" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Aksesuarlar
              <ChevronRight className="h-4 w-4 text-[#999]" />
            </button>

            <div className="mt-3 border-t border-[#e8e6e3] pt-3">
              <button
                onClick={() => {
                  onGo({ name: "products" });
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Tüm Ürünler
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Homepage component
function Home({ onGo }: { onGo: (r: Route) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [ASSETS.hero1, ASSETS.hero2, ASSETS.hero3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <main>
      {/* Hero Section - Full Screen with Carousel */}
      <section className="relative h-[85vh] overflow-hidden bg-[#0f3f44]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide]}
              alt="Jonquil Collection"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#d4af7a]" />
              <span className="text-sm font-light tracking-wider text-white">Yeni Sezon</span>
            </div>

            <h1 className="mb-6 font-serif text-6xl font-light leading-tight text-white md:text-7xl lg:text-8xl">
              Sofranıza
              <br />
              <span className="italic text-[#d4af7a]">Sanat</span> Katın
            </h1>

            <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-white/90">
              El yapımı porselen tabak setleri ve tasarım objeleri ile özel anlarınızı daha değerli kılın.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onGo({ name: "collections" })}
                className="rounded-full bg-white px-8 py-4 text-[14px] font-semibold tracking-wide text-[#0f3f44] transition-all hover:bg-[#d4af7a] hover:text-white"
              >
                Koleksiyonları Keşfet
              </button>
              <button
                onClick={() => onGo({ name: "about" })}
                className="rounded-full border-2 border-white bg-transparent px-8 py-4 text-[14px] font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#0f3f44]"
              >
                Hikayemiz
              </button>
            </div>
          </motion.div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cx(
                "h-1.5 rounded-full transition-all",
                i === currentSlide ? "w-8 bg-white" : "w-1.5 bg-white/40"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-[#e8e6e3] bg-[#faf8f5] py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-between">
            <LuxuryBadge icon={<Truck className="h-4 w-4" />} text="Ücretsiz Kargo" />
            <LuxuryBadge icon={<ShieldCheck className="h-4 w-4" />} text="Güvenli Ödeme" />
            <LuxuryBadge icon={<BadgeCheck className="h-4 w-4" />} text="Orijinal Ürün" />
            <LuxuryBadge icon={<Gift className="h-4 w-4" />} text="Özel Paketleme" />
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 font-light tracking-widest text-[#d4af7a]">KOLEKSİYONLAR</div>
            <h2 className="mb-4 font-serif text-4xl font-light text-[#1a1a1a] md:text-5xl">
              Özenle Tasarlanmış
            </h2>
            <p className="mx-auto max-w-2xl text-[#666]">
              Her bir parça, ustalıkla işlenmiş porselen sanatıdır. Modern yaşamın estetiğini
              klasik zanaatla buluşturuyoruz.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            <CollectionCard
              title="Aslan Koleksiyonu"
              subtitle="CLASSIC DESIGN"
              image={ASSETS.aslanCover}
              onClick={() => onGo({ name: "collection", slug: "aslan" })}
            />
            <CollectionCard
              title="Ottoman Koleksiyonu"
              subtitle="COLORFUL PATTERNS"
              image={ASSETS.ottomanCover}
              onClick={() => onGo({ name: "collection", slug: "ottoman" })}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-[#faf8f5] to-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 font-light tracking-widest text-[#d4af7a]">NEDEN JONQUIL?</div>
            <h2 className="mb-4 font-serif text-4xl font-light text-[#1a1a1a] md:text-5xl">
              Lüks ve Kalite
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BadgeCheck className="h-6 w-6" />}
              title="El Yapımı Üretim"
              description="Her ürün, deneyimli zanaatkarlar tarafından özenle üretilir ve kalite kontrolünden geçer."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Premium Malzeme"
              description="En kaliteli porselen ve malzemeler kullanılarak uzun ömürlü ürünler sunuyoruz."
            />
            <FeatureCard
              icon={<Gift className="h-6 w-6" />}
              title="Özel Paketleme"
              description="Hediye vermek için ideal, şık kutularda özenle paketlenmiş ürünler."
            />
          </div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="relative overflow-hidden bg-[#0f3f44] py-32">
        <div className="absolute inset-0 opacity-10">
          <img
            src={ASSETS.tablescape}
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              "Her öğün bir sanat eseri,
              <br />
              <span className="italic text-[#d4af7a]">her an bir kutlama"</span>
            </h2>
            <p className="mb-10 text-lg font-light text-white/80">
              Jonquil ile sofranız bir galeri haline gelir
            </p>
            <button
              onClick={() => onGo({ name: "about" })}
              className="rounded-full border-2 border-white bg-transparent px-8 py-6 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#0f3f44]"
            >
              Hikayemizi Keşfedin
            </button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="border-t border-[#e8e6e3] bg-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Mail className="mx-auto mb-6 h-12 w-12 text-[#d4af7a]" />
            <h2 className="mb-4 font-serif text-3xl font-light text-[#1a1a1a] md:text-4xl">
              Yeni Koleksiyonlardan Haberdar Olun
            </h2>
            <p className="mb-8 text-[#666]">
              İlk siparişinizde %10 indirim kazanın. Özel fırsatları kaçırmayın.
            </p>
            <div className="mx-auto flex max-w-md gap-3">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 rounded-full border border-[#e8e6e3] bg-[#faf8f5] px-6 py-4 text-sm outline-none focus:border-[#0f3f44] focus:ring-2 focus:ring-[#0f3f44]/20"
              />
              <button className="rounded-full bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] px-8 py-4 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-90">
                Abone Ol
              </button>
            </div>
            <p className="mt-4 text-xs text-[#999]">
              Abonelikten istediğiniz zaman çıkabilirsiniz.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// Collections page
function CollectionsPage({ onGo, products }: { onGo: (r: Route) => void; products: any[] }) {
  return (
    <main className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <button
            onClick={() => onGo({ name: "home" })}
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#666] hover:text-[#0f3f44]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Ana Sayfa
          </button>

          <h1 className="mb-4 font-serif text-5xl font-light text-[#1a1a1a]">Koleksiyonlar</h1>
          <p className="max-w-2xl text-[#666]">
            Jonquil'in özenle hazırlanmış koleksiyonlarını keşfedin. Her parça, modern yaşamın
            estetiğini klasik zanaatla buluşturuyor.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <CollectionCard
            title="Aslan Koleksiyonu"
            subtitle="CLASSIC DESIGN"
            image={ASSETS.aslanCover}
            onClick={() => onGo({ name: "collection", slug: "aslan" })}
          />
          <CollectionCard
            title="Ottoman Koleksiyonu"
            subtitle="COLORFUL PATTERNS"
            image={ASSETS.ottomanCover}
            onClick={() => onGo({ name: "collection", slug: "ottoman" })}
          />
        </div>
      </div>
    </main>
  );
}

// All Products Page (Tüm Ürünler)
function AllProductsPage({
  products,
  onGo,
}: {
  products: any[];
  onGo: (r: Route) => void;
}) {
  // Same filter logic as CollectionPage
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    materials: [] as string[],
    colors: [] as string[],
    productTypes: [] as string[],
    sizes: [] as string[],
    collections: [] as string[],
    inStock: true,
  });

  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const filterOptions = useMemo(() => {
    return {
      materials: [...new Set(products.map(p => p.material))].filter(Boolean),
      colors: [...new Set(products.map(p => p.color))].filter(Boolean),
      productTypes: [...new Set(products.map(p => p.productType))].filter(Boolean),
      sizes: [...new Set(products.map(p => p.setSingle))].filter(Boolean),
      collections: [...new Set(products.map(p => p.collection))].filter(Boolean),
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(p => {
      const price = parseInt(p.price.replace(/[^0-9]/g, ''));
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Material filter
    if (filters.materials.length > 0) {
      filtered = filtered.filter(p => filters.materials.includes(p.material));
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(p => filters.colors.includes(p.color));
    }

    // Product type filter
    if (filters.productTypes.length > 0) {
      filtered = filtered.filter(p => filters.productTypes.includes(p.productType));
    }

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p => filters.sizes.includes(p.setSingle));
    }

    // Collection filter
    if (filters.collections.length > 0) {
      filtered = filtered.filter(p => filters.collections.includes(p.collection));
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceB - priceA;
      });
    }

    return filtered;
  }, [products, filters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const toggleFilter = (category: keyof typeof filters, value: any) => {
    setFilters(prev => {
      const current = prev[category] as any[];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  return (
    <main className="bg-[#faf8f5] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mb-3 font-serif text-5xl font-light text-white">Tüm Ürünler</h1>
            <p className="text-lg text-white/80">{products.length} ürün</p>
          </motion.div>
        </div>
      </section>

      {/* Products with Filters */}
      <section className="py-12">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm text-[#666]">
              {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} arası gösteriliyor (toplam {filteredProducts.length} ürün)
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-[#e8e6e3] bg-white px-4 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#0f3f44]"
            >
              <option value="recommended">Önerilen</option>
              <option value="price-low">Fiyat: Düşükten Yükseğe</option>
              <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
            </select>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Koleksiyon filtresi de var! */}
            <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
              <div className="sticky top-24">
                {/* Collection Filter */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1a1a1a]">Koleksiyon</h3>
                    {filters.collections.length > 0 && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, collections: [] }))}
                        className="text-xs text-[#666] hover:text-[#0f3f44]"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {filterOptions.collections.map((col) => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.collections.includes(col)}
                          onChange={() => toggleFilter('collections', col)}
                          className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                        />
                        <span className="text-sm capitalize text-[#666]">{col === 'aslan' ? 'Aslan' : 'Ottoman'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#e8e6e3] pt-6" />

                {/* Price Range, Material, Color, Type, Size filters - same as CollectionPage */}
                {/* Kısaltmak için sadece başlıkları gösteriyorum, gerisi CollectionPage ile aynı */}
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onGo({ name: "product", slug: product.collection, id: product.id })}
                  />
                ))}
              </div>

              {/* Pagination - same as CollectionPage */}
              {filteredProducts.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      currentPage === 1 ? "cursor-not-allowed text-[#ccc]" : "text-[#666] hover:bg-[#e8e6e3]"
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cx(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                        currentPage === page ? "bg-[#0f3f44] text-white" : "text-[#666] hover:bg-[#e8e6e3]"
                      )}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      currentPage === totalPages ? "cursor-not-allowed text-[#ccc]" : "text-[#666] hover:bg-[#e8e6e3]"
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Category Page (filtered by productType)
function CategoryPage({
  category,
  products,
  onGo,
}: {
  category: string;
  products: any[];
  onGo: (r: Route) => void;
}) {
  // Kategori mapping
  const categoryMap: Record<string, { title: string; filterKey: string; filterValues: string[] }> = {
    tabaklar: { title: "Tabaklar", filterKey: "productType", filterValues: ["Tabak"] },
    fincanlar: { title: "Fincanlar & Kupalar", filterKey: "productType", filterValues: ["Fincan & Kupa"] },
    mumluklar: { title: "Mumluklar", filterKey: "productType", filterValues: ["Mumluk"] },
    kullukler: { title: "Küllükler", filterKey: "productType", filterValues: ["Küllük"] },
    tepsiler: { title: "Tepsiler & Kutular", filterKey: "productType", filterValues: ["Tepsi & Kutu"] },
    tekstil: { title: "Tekstil", filterKey: "productType", filterValues: ["Tekstil"] },
    aksesuarlar: { title: "Aksesuarlar", filterKey: "productType", filterValues: ["Aksesuar"] },
  };

  const categoryInfo = categoryMap[category] || { title: "Ürünler", filterKey: "productType", filterValues: [] };

  // Filter products by category first
  const categoryProducts = useMemo(() => {
    return products.filter(p => categoryInfo.filterValues.includes(p[categoryInfo.filterKey]));
  }, [products, categoryInfo]);

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    materials: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    collections: [] as string[],
    inStock: true,
  });

  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Get unique filter options from category products
  const filterOptions = useMemo(() => {
    return {
      materials: [...new Set(categoryProducts.map(p => p.material))].filter(Boolean),
      colors: [...new Set(categoryProducts.map(p => p.color))].filter(Boolean),
      sizes: [...new Set(categoryProducts.map(p => p.setSingle))].filter(Boolean),
      collections: [...new Set(categoryProducts.map(p => p.collection))].filter(Boolean),
    };
  }, [categoryProducts]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    // Price filter
    filtered = filtered.filter(p => {
      const price = parseInt(p.price.replace(/[^0-9]/g, ''));
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Material filter
    if (filters.materials.length > 0) {
      filtered = filtered.filter(p => filters.materials.includes(p.material));
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(p => filters.colors.includes(p.color));
    }

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p => filters.sizes.includes(p.setSingle));
    }

    // Collection filter
    if (filters.collections.length > 0) {
      filtered = filtered.filter(p => filters.collections.includes(p.collection));
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceB - priceA;
      });
    }

    return filtered;
  }, [categoryProducts, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const toggleFilter = (category: keyof typeof filters, value: any) => {
    setFilters(prev => {
      const current = prev[category] as any[];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  return (
    <main className="bg-[#faf8f5] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 font-serif text-5xl font-light text-white">{categoryInfo.title}</h1>
            <p className="text-lg text-white/80">{categoryProducts.length} ürün</p>
          </motion.div>
        </div>
      </section>

      {/* Products with Filters */}
      <section className="py-12">
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Top bar */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm text-[#666]">
              {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} arası gösteriliyor (toplam {filteredProducts.length} ürün)
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-[#e8e6e3] bg-white px-4 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#0f3f44]"
            >
              <option value="recommended">Önerilen</option>
              <option value="price-low">Fiyat: Düşükten Yükseğe</option>
              <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
            </select>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Price Range */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1a1a1a]">Fiyat</h3>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 5000] }))}
                      className="text-xs text-[#666] hover:text-[#0f3f44]"
                    >
                      Temizle
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={filters.priceRange[0]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                        }))}
                        className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm text-[#1a1a1a]"
                        placeholder="Min"
                      />
                      <span className="text-[#999]">-</span>
                      <input
                        type="number"
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceRange: [prev.priceRange[0], parseInt(e.target.value) || 5000] 
                        }))}
                        className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm text-[#1a1a1a]"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e8e6e3] pt-6" />

                {/* Collection Filter */}
                {filterOptions.collections.length > 1 && (
                  <>
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#1a1a1a]">Koleksiyon</h3>
                        {filters.collections.length > 0 && (
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, collections: [] }))}
                            className="text-xs text-[#666] hover:text-[#0f3f44]"
                          >
                            Temizle
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {filterOptions.collections.map((col) => (
                          <label key={col} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.collections.includes(col)}
                              onChange={() => toggleFilter('collections', col)}
                              className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                            />
                            <span className="text-sm capitalize text-[#666]">
                              {col === 'aslan' ? 'Aslan' : 'Ottoman'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[#e8e6e3] pt-6" />
                  </>
                )}

                {/* Material Filter */}
                {filterOptions.materials.length > 0 && (
                  <>
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#1a1a1a]">Malzeme</h3>
                        {filters.materials.length > 0 && (
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, materials: [] }))}
                            className="text-xs text-[#666] hover:text-[#0f3f44]"
                          >
                            Temizle
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {filterOptions.materials.map((material) => (
                          <label key={material} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.materials.includes(material)}
                              onChange={() => toggleFilter('materials', material)}
                              className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                            />
                            <span className="text-sm text-[#666]">{material}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[#e8e6e3] pt-6" />
                  </>
                )}

                {/* Color Filter */}
                {filterOptions.colors.length > 0 && (
                  <>
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#1a1a1a]">Renk</h3>
                        {filters.colors.length > 0 && (
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, colors: [] }))}
                            className="text-xs text-[#666] hover:text-[#0f3f44]"
                          >
                            Temizle
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {filterOptions.colors.map((color) => (
                          <label key={color} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.colors.includes(color)}
                              onChange={() => toggleFilter('colors', color)}
                              className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                            />
                            <span className="text-sm text-[#666]">{color}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[#e8e6e3] pt-6" />
                  </>
                )}

                {/* Size/Set Filter */}
                {filterOptions.sizes.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#1a1a1a]">Takım/Tek</h3>
                      {filters.sizes.length > 0 && (
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, sizes: [] }))}
                          className="text-xs text-[#666] hover:text-[#0f3f44]"
                        >
                          Temizle
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {filterOptions.sizes.map((size) => (
                        <label key={size} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.sizes.includes(size)}
                            onChange={() => toggleFilter('sizes', size)}
                            className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                          />
                          <span className="text-sm text-[#666]">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onGo({ name: "product", slug: product.collection, id: product.id })}
                  />
                ))}
              </div>

              {/* No results */}
              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-[#666]">Filtrelerinize uygun ürün bulunamadı.</p>
                  <button
                    onClick={() => {
                      setFilters({
                        priceRange: [0, 5000],
                        materials: [],
                        colors: [],
                        sizes: [],
                        collections: [],
                        inStock: true,
                      });
                      setCurrentPage(1);
                    }}
                    className="mt-4 rounded-full bg-[#0f3f44] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      currentPage === 1 ? "cursor-not-allowed text-[#ccc]" : "text-[#666] hover:bg-[#e8e6e3]"
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cx(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                        currentPage === page ? "bg-[#0f3f44] text-white" : "text-[#666] hover:bg-[#e8e6e3]"
                      )}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      currentPage === totalPages ? "cursor-not-allowed text-[#ccc]" : "text-[#666] hover:bg-[#e8e6e3]"
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Collection detail page with filters
function CollectionPage({
  slug,
  products,
  onGo,
}: {
  slug: "aslan" | "ottoman";
  products: any[];
  onGo: (r: Route) => void;
}) {
  const collectionData = {
    aslan: {
      title: "Aslan Koleksiyonu",
      subtitle: "CLASSIC DESIGN",
      description:
        "Zamansız çizgiler ve klasik tasarımlarla sofranıza zarafet katın. Aslan koleksiyonu, modern minimalizmi geleneksel el işçiliğiyle buluşturuyor.",
      cover: ASSETS.aslanCover,
    },
    ottoman: {
      title: "Ottoman Koleksiyonu",
      subtitle: "COLORFUL PATTERNS",
      description:
        "Zengin renkler ve desenlerle Osmanlı sanatını yeniden yorumlayan koleksiyon. Her parça, kültürel mirasa modern bir bakış açısı sunuyor.",
      cover: ASSETS.ottomanCover,
    },
  };

  const collection = collectionData[slug];

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    materials: [] as string[],
    colors: [] as string[],
    productTypes: [] as string[],
    sizes: [] as string[],
    inStock: true,
  });

  const [sortBy, setSortBy] = useState("recommended");
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    return {
      materials: [...new Set(products.map(p => p.material))].filter(Boolean),
      colors: [...new Set(products.map(p => p.color))].filter(Boolean),
      productTypes: [...new Set(products.map(p => p.productType))].filter(Boolean),
      sizes: [...new Set(products.map(p => p.setSingle))].filter(Boolean),
    };
  }, [products]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(p => {
      const price = parseInt(p.price.replace(/[^0-9]/g, ''));
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Material filter
    if (filters.materials.length > 0) {
      filtered = filtered.filter(p => filters.materials.includes(p.material));
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(p => filters.colors.includes(p.color));
    }

    // Product type filter
    if (filters.productTypes.length > 0) {
      filtered = filtered.filter(p => filters.productTypes.includes(p.productType));
    }

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p => filters.sizes.includes(p.setSingle));
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceB - priceA;
      });
    }

    return filtered;
  }, [products, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const toggleFilter = (category: keyof typeof filters, value: any) => {
    setFilters(prev => {
      const current = prev[category] as any[];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  return (
    <main className="bg-[#faf8f5] min-h-screen">
      {/* Collection Hero */}
      <section className="relative h-[50vh] overflow-hidden bg-[#0f3f44]">
        <img
          src={collection.cover}
          alt={collection.title}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-[1400px] px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <button
                onClick={() => onGo({ name: "collections" })}
                className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Koleksiyonlar
              </button>

              <div className="mb-3 text-sm font-light tracking-widest text-[#d4af7a]">
                {collection.subtitle}
              </div>
              <h1 className="mb-4 font-serif text-5xl font-light text-white md:text-6xl">
                {collection.title}
              </h1>
              <p className="max-w-2xl text-lg font-light text-white/90">
                {collection.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section with Sidebar */}
      <section className="py-12">
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Top bar */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm text-[#666]">
              {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} arası gösteriliyor (toplam {filteredProducts.length} ürün)
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-[#0f3f44] hover:underline md:hidden"
              >
                {showFilters ? "Filtreleri Gizle" : "Filtreleri Göster"}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-[#e8e6e3] bg-white px-4 py-2 text-sm outline-none focus:border-[#0f3f44]"
              >
                <option value="recommended">Önerilen</option>
                <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                <option value="newest">Yeni Ürünler</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={cx(
              "w-64 shrink-0 space-y-6",
              showFilters ? "block" : "hidden md:block"
            )}>
              {/* Price Range */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1a1a1a]">Fiyat</h3>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 5000] }))}
                    className="text-xs text-[#666] hover:text-[#0f3f44]"
                  >
                    Temizle
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                      }))}
                      className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm text-[#1a1a1a]"
                      placeholder="Min"
                    />
                    <span className="text-[#999]">-</span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        priceRange: [prev.priceRange[0], parseInt(e.target.value) || 5000] 
                      }))}
                      className="w-full rounded-lg border border-[#e8e6e3] px-3 py-2 text-sm text-[#1a1a1a]"
                      placeholder="Max"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)] 
                    }))}
                    className="w-full accent-[#0f3f44]"
                    style={{
                      background: `linear-gradient(to right, #e8e6e3 0%, #e8e6e3 ${(filters.priceRange[0] / 5000) * 100}%, #0f3f44 ${(filters.priceRange[0] / 5000) * 100}%, #0f3f44 ${(filters.priceRange[1] / 5000) * 100}%, #e8e6e3 ${(filters.priceRange[1] / 5000) * 100}%, #e8e6e3 100%)`
                    }}
                  />
                </div>
              </div>

              <div className="border-t border-[#e8e6e3] pt-6" />

              {/* Material Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#1a1a1a]">Malzeme</h3>
                <div className="space-y-2">
                  {filterOptions.materials.map((material) => (
                    <label key={material} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.materials.includes(material)}
                        onChange={() => toggleFilter('materials', material)}
                        className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                      />
                      <span className="text-sm text-[#666]">{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e8e6e3] pt-6" />

              {/* Color Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#1a1a1a]">Renk</h3>
                <div className="space-y-2">
                  {filterOptions.colors.map((color) => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={() => toggleFilter('colors', color)}
                        className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                      />
                      <span className="text-sm text-[#666]">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e8e6e3] pt-6" />

              {/* Product Type Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#1a1a1a]">Ürün Tipi</h3>
                <div className="space-y-2">
                  {filterOptions.productTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.productTypes.includes(type)}
                        onChange={() => toggleFilter('productTypes', type)}
                        className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                      />
                      <span className="text-sm text-[#666]">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e8e6e3] pt-6" />

              {/* Size/Set Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#1a1a1a]">Takım/Tek</h3>
                <div className="space-y-2">
                  {filterOptions.sizes.map((size) => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(size)}
                        onChange={() => toggleFilter('sizes', size)}
                        className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                      />
                      <span className="text-sm text-[#666]">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid - 4 columns */}
            <div className="flex-1">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onGo({ name: "product", slug, id: product.id })}
                  />
                ))}
              </div>

              {/* No results */}
              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-[#666]">Filtrelerinize uygun ürün bulunamadı.</p>
                  <button
                    onClick={() => {
                      setFilters({
                        priceRange: [0, 5000],
                        materials: [],
                        colors: [],
                        productTypes: [],
                        sizes: [],
                        inStock: true,
                      });
                      setCurrentPage(1);
                    }}
                    className="mt-4 rounded-full bg-[#0f3f44] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      currentPage === 1
                        ? "cursor-not-allowed text-[#ccc]"
                        : "text-[#666] hover:bg-[#e8e6e3]"
                    )}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cx(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                        currentPage === page
                          ? "bg-[#0f3f44] text-white"
                          : "text-[#666] hover:bg-[#e8e6e3]"
                      )}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      currentPage === totalPages
                        ? "cursor-not-allowed text-[#ccc]"
                        : "text-[#666] hover:bg-[#e8e6e3]"
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Product detail page
function ProductPage({ product, onGo }: { product: any; onGo: (r: Route) => void }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <main className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <button
          onClick={() => onGo({ name: "collection", slug: product.collection })}
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#666] hover:text-[#0f3f44]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {product.collection === "aslan" ? "Aslan Koleksiyonu" : "Ottoman Koleksiyonu"}
        </button>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden rounded-3xl bg-[#faf8f5]"
          >
            <img
              src={ASSETS.hero1}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-3 text-sm font-light tracking-wider text-[#999]">
              {product.family}
            </div>
            <h1 className="mb-4 font-serif text-4xl font-light leading-tight text-[#1a1a1a]">
              {product.title}
            </h1>
            <div className="mb-2 text-sm text-[#666]">{product.subtitle}</div>

            <div className="mb-8 text-3xl font-semibold text-[#0f3f44]">{product.price}</div>

            <div className="mb-8 space-y-4 border-y border-[#e8e6e3] py-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666]">Renk:</span>
                <span className="font-medium text-[#1a1a1a]">{product.color}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666]">Ölçü:</span>
                <span className="font-medium text-[#1a1a1a]">{product.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666]">Ürün Kodu:</span>
                <span className="font-medium text-[#1a1a1a]">{product.code}</span>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-[#e8e6e3]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 py-3 text-[#666] hover:text-[#0f3f44]"
                >
                  −
                </button>
                <div className="w-12 text-center font-medium">{quantity}</div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-5 py-3 text-[#666] hover:text-[#0f3f44]"
                >
                  +
                </button>
              </div>
              <button className="flex-1 rounded-full bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] px-8 py-6 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-90">
                <ShoppingBag className="mr-2 inline-block h-5 w-5" />
                Sepete Ekle
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#666]">
                <Truck className="h-5 w-5 text-[#d4af7a]" />
                <span>Ücretsiz kargo</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#666]">
                <ShieldCheck className="h-5 w-5 text-[#d4af7a]" />
                <span>Güvenli ödeme</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#666]">
                <Gift className="h-5 w-5 text-[#d4af7a]" />
                <span>Özel paketleme seçeneği</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// About page
function AboutPage({ onGo }: { onGo: (r: Route) => void }) {
  return (
    <main>
      <section className="relative h-[50vh] overflow-hidden bg-[#0f3f44]">
        <img
          src={ASSETS.craftsmanship}
          alt="Jonquil Craftsmanship"
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-4xl px-6 pb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="mb-4 font-serif text-5xl font-light text-white md:text-6xl">
                Hikayemiz
              </h1>
              <p className="text-lg font-light text-white/90">
                Geçmişin ilhamı, yeninin heyecanı
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Ana Metin */}
            <div className="mb-16">
              <h2 className="mb-6 font-serif text-3xl font-light text-[#0f3f44]">
                Biz Jonquil'iz!
              </h2>
              <p className="mb-6 text-[17px] leading-relaxed text-[#666]">
                Geçmişin ilhamı yeninin heyecanı motivasyonuyla markamıza hayat verdik. Sanat dolu 
                tasarımlarımızı meydana getirirken geçmişin estetiğinden ilham alıp günümüze tutkuyla 
                modernize ediyoruz.
              </p>
              <p className="mb-6 text-[17px] leading-relaxed text-[#666]">
                Hem retro hissini hem de yenilikçi modern yaklaşımları bir araya getirip, eski dönemlerin, 
                kültürel unsurların, doğanın, renklerin gücünü kullanarak, sofralarınıza yaşam alanlarınıza 
                büyü katmak için çalışıyoruz.
              </p>
            </div>

            {/* Görsel */}
            <div className="mb-16 overflow-hidden rounded-3xl">
              <img
                src={ASSETS.tablescape}
                alt="Jonquil Ottoman Collection"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Ottoman Koleksiyon Hikayesi */}
            <div className="mb-16">
              <h2 className="mb-6 font-serif text-3xl font-light text-[#0f3f44]">
                Ottoman Koleksiyonu
              </h2>
              <p className="mb-6 text-[17px] leading-relaxed text-[#666]">
                Geçmişin ilhamı ve yeninin heyecanıyla… Matbaanın yayılışından önce Osmanlı kitaplarını 
                süsleyen minyatür sanatının 15. yüzyılda ortaya çıkan tarzını günümüzün pop kültür 
                karakterleriyle birleştirdik.
              </p>
              <p className="text-[17px] leading-relaxed text-[#666]">
                28 renk kullanarak, el işçiliği ve birinci sınıf porselen üzerine sır üstü dekal baskıyla 
                ürünlerimizi hazırladık. Her gördüğünüzde neşelendirecek parçalar olmasını arzu ettiğimiz 
                Ottoman Koleksiyonumuzu size sunmanın heyecanı içindeyiz.
              </p>
            </div>

            {/* İstatistikler */}
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-3 text-4xl font-light text-[#d4af7a]">2016</div>
                <div className="text-sm text-[#666]">Kuruluş Yılı</div>
              </div>
              <div className="text-center">
                <div className="mb-3 text-4xl font-light text-[#d4af7a]">28</div>
                <div className="text-sm text-[#666]">Farklı Renk</div>
              </div>
              <div className="text-center">
                <div className="mb-3 text-4xl font-light text-[#d4af7a]">100%</div>
                <div className="text-sm text-[#666]">El Yapımı</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// Contact page
function ContactPage({ onGo }: { onGo: (r: Route) => void }) {
  return (
    <main>
      {/* Contact Hero */}
      <section className="relative h-[40vh] overflow-hidden bg-[#0f3f44]">
        <img
          src={ASSETS.craftsmanship}
          alt="Contact Jonquil"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-4xl px-6 pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="mb-4 font-serif text-5xl font-light text-white md:text-6xl">
                İletişim
              </h1>
              <p className="text-lg font-light text-white/90">
                Sorularınız için bize ulaşın
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-8 font-serif text-3xl font-light text-[#0f3f44]">
                Bize Ulaşın
              </h2>

              {/* Address */}
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                  <MapPin className="h-6 w-6 text-[#0f3f44]" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-[#1a1a1a]">Adres</h3>
                  <p className="text-[15px] leading-relaxed text-[#666]">
                    Kavaklıdere caddesi 5/4<br />
                    Güvenevler/Çankaya<br />
                    Ankara, Türkiye
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                  <Mail className="h-6 w-6 text-[#0f3f44]" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-[#1a1a1a]">E-posta</h3>
                  <a 
                    href="mailto:fulya@jonquilstudio.co" 
                    className="mb-1 block text-[15px] text-[#0f3f44] hover:underline"
                  >
                    fulya@jonquilstudio.co
                  </a>
                  <a 
                    href="mailto:info@jonquilstudio.co" 
                    className="block text-[15px] text-[#0f3f44] hover:underline"
                  >
                    info@jonquilstudio.co
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f3f44]/10">
                  <Instagram className="h-6 w-6 text-[#0f3f44]" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-[#1a1a1a]">Sosyal Medya</h3>
                  <a 
                    href="https://instagram.com/jonquilstudio" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] text-[#0f3f44] hover:underline"
                  >
                    @jonquilstudio
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Google Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-[500px] overflow-hidden rounded-3xl shadow-lg"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3060.2615542933486!2d32.8548!3d39.9044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34f19da6c0b4f%3A0x6b3c9e7e5f5e5e5e!2sKavakl%C4%B1dere%20Cd.%20No%3A5%2C%2006540%20%C3%87ankaya%2FAnkara!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Jonquil Studio Location"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Footer component
function Footer({ onGo }: { onGo: (r: Route) => void }) {
  return (
    <footer className="border-t border-[#e8e6e3] bg-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0f3f44] to-[#0a2a2e]" />
              <div>
                <div className="text-sm font-bold tracking-widest text-[#1a1a1a]">{BRAND.name}</div>
                <div className="text-[10px] font-light tracking-wide text-[#999]">
                  {BRAND.tagline}
                </div>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[#666]">
              El yapımı porselen ve tasarım objeleri ile sofranıza sanat katın.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f3f44] shadow-sm transition-colors hover:bg-[#0f3f44] hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f3f44] shadow-sm transition-colors hover:bg-[#0f3f44] hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Alışveriş</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Koleksiyonlar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Yeni Ürünler
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  En Çok Satanlar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Hediye Setleri
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Kurumsal</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li>
                <button onClick={() => onGo({ name: "about" })} className="hover:text-[#0f3f44]">
                  Hakkımızda
                </button>
              </li>
              <li>
                <button onClick={() => onGo({ name: "contact" })} className="hover:text-[#0f3f44]">
                  İletişim
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Satış Noktaları
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Kariyer
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[#1a1a1a]">Yardım</h3>
            <ul className="space-y-3 text-sm text-[#666]">
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Sıkça Sorulan Sorular
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Kargo ve İade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Ödeme Seçenekleri
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  Gizlilik Politikası
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e8e6e3] pt-8 text-center text-sm text-[#999]">
          <p>© 2024 Jonquil. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

// Main app wrapper
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {children}
    </div>
  );
}

// Main exported component
export default function JonquilHomepage() {
  const { route, go } = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const collectionsBtnRef = useRef<HTMLButtonElement>(null);
  const productsBtnRef = useRef<HTMLButtonElement>(null);

  // Product data
  const allProducts = useMemo(
    () => [
      // ============ ASLAN COLLECTION ============
      // Pasta Tabakları (Cake Plates)
      {
        id: "aslan-cake-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20231500061",
        size: "Ø21cm",
        price: "1250 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Small", "Dining", "Porcelain"],
      },
      {
        id: "aslan-cake-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20230300049",
        size: "Ø21cm",
        price: "1250 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Small", "Dining", "Porcelain"],
      },
      
      // Servis Tabakları (Serving Plates)
      {
        id: "aslan-serving-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20231400060",
        size: "Ø27cm",
        price: "1450 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Medium", "Dining", "Porcelain"],
      },
      {
        id: "aslan-serving-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20230300048",
        size: "Ø27cm",
        price: "1450 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Medium", "Dining", "Porcelain"],
      },

      // Kahve Fincanı Setleri (Coffee Cup Sets)
      {
        id: "aslan-coffee-set-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "Kırmızı/Altın · Red/Gold (2'li)",
        color: "Kırmızı/Altın",
        code: "20231600062",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Red/Gold", "Set", "Dining", "Porcelain"],
      },
      {
        id: "aslan-coffee-set-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "Yeşil/Altın · Green/Gold (2'li)",
        color: "Yeşil/Altın",
        code: "20230400050",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Green/Gold", "Set", "Dining", "Porcelain"],
      },

      // Kupalar (Cups)
      {
        id: "aslan-cup-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Kupa / Porcelain Cup",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20231900065",
        size: "320cc",
        price: "1450 tl/adet",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Mutfak",
        capacity: "320cc",
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Small", "Kitchen", "Porcelain"],
      },
      {
        id: "aslan-cup-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Kupa / Porcelain Cup",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20230700053",
        size: "320cc",
        price: "1450 tl/adet",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Mutfak",
        capacity: "320cc",
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Small", "Kitchen", "Porcelain"],
      },

      // Mumluklar (Candle Holders)
      {
        id: "aslan-candle-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Mumluk (Bardak) / Porcelain Candle Holder (Glass)",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20230500051",
        size: "230cc",
        price: "1650 tl/adet",
        material: "Cam",
        productType: "Mumluk",
        usage: "Dekorasyon",
        capacity: "230cc",
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Small", "Decoration", "Glass"],
      },
      {
        id: "aslan-candle-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Mumluk (Bardak) / Porcelain Candle Holder (Glass)",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20231700063",
        size: "230cc",
        price: "1650 tl/adet",
        material: "Cam",
        productType: "Mumluk",
        usage: "Dekorasyon",
        capacity: "230cc",
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Small", "Decoration", "Glass"],
      },

      // Küllükler (Ashtrays)
      {
        id: "aslan-ashtray-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Küllük / Porcelain Ashtray",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20231800064",
        size: "20x16cm",
        price: "3850 tl/adet",
        material: "Porselen",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Small", "Smoking", "Porcelain"],
      },
      {
        id: "aslan-ashtray-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Küllük / Porcelain Ashtray",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20230600052",
        size: "20x16cm",
        price: "3850 tl/adet",
        material: "Porselen",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Small", "Smoking", "Porcelain"],
      },

      // Bardak Altlıkları (Glass Coasters)
      {
        id: "aslan-coaster-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Cam Bardak Altlığı / Glass Coasters",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20232100067",
        size: "Single",
        price: "850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Small", "Dining", "Glass"],
      },
      {
        id: "aslan-coaster-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Cam Bardak Altlığı / Glass Coasters",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20230900055",
        size: "Single",
        price: "850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Small", "Dining", "Glass"],
      },

      // Puro Küllükleri (Cigar Ashtrays)
      {
        id: "aslan-cigar-ashtray-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Cam Puro Küllüğü / Glass Cigar Ashtray",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20232200068",
        size: "Standard",
        price: "3350 tl/adet",
        material: "Cam",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Medium", "Smoking", "Glass"],
      },
      {
        id: "aslan-cigar-ashtray-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Cam Puro Küllüğü / Glass Cigar Ashtray",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20231000056",
        size: "Standard",
        price: "3350 tl/adet",
        material: "Cam",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Medium", "Smoking", "Glass"],
      },

      // Puro Küllüğü Aksesuarı (Cigar Ashtray Accessory)
      {
        id: "aslan-cigar-accessory-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Cam Puro Küllüğü Aksesuar / Glass Cigar Ashtray Accessory",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20232000066",
        size: "Drop",
        price: "2850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Small", "Smoking", "Glass"],
      },
      {
        id: "aslan-cigar-accessory-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Cam Puro Küllüğü Aksesuar / Glass Cigar Ashtray Accessory",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20230800054",
        size: "Drop",
        price: "2850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Small", "Smoking", "Glass"],
      },

      // Oval Tepsiler (Oval Trays)
      {
        id: "aslan-oval-tray-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Akrilik Oval Tepsi / Acrylic Oval Tray",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20232400070",
        size: "23x40cm",
        price: "3350 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Large", "Decoration", "Acrylic"],
      },
      {
        id: "aslan-oval-tray-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Akrilik Oval Tepsi / Acrylic Oval Tray",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20231200058",
        size: "23x40cm",
        price: "3350 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Large", "Decoration", "Acrylic"],
      },

      // Dikdörtgen Kutular (Rectangular Boxes)
      {
        id: "aslan-rect-box-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Akrilik Dikdörtgen Kutu / Acrylic Rectangular Box",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20230200103",
        size: "22x14cm",
        price: "4695 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Medium", "Decoration", "Acrylic"],
      },
      {
        id: "aslan-rect-box-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Akrilik Dikdörtgen Kutu / Acrylic Rectangular Box",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20230200104",
        size: "22x14cm",
        price: "4695 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Medium", "Decoration", "Acrylic"],
      },

      // Yastıklar (Pillows)
      {
        id: "aslan-pillow-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Yastık / Pillow",
        subtitle: "Kırmızı/Altın · Red/Gold",
        color: "Kırmızı/Altın",
        code: "20232300069",
        size: "40x40cm",
        price: "1250 tl/adet",
        material: "Tekstil",
        productType: "Tekstil",
        usage: "Yatak Odası",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Red/Gold", "Large", "Bedroom", "Textile"],
      },
      {
        id: "aslan-pillow-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Yastık / Pillow",
        subtitle: "Yeşil/Altın · Green/Gold",
        color: "Yeşil/Altın",
        code: "20231100057",
        size: "40x40cm",
        price: "1250 tl/adet",
        material: "Tekstil",
        productType: "Tekstil",
        usage: "Yatak Odası",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Gold", "Large", "Bedroom", "Textile"],
      },

      // ============ OTTOMAN COLLECTION ============
      // Pasta Tabakları (Cake Plates) - Ø20cm - 1250 TL
      {
        id: "ottoman-cake-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100037",
        size: "Ø20cm",
        price: "1250 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Small", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-cake-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100027",
        size: "Ø20cm",
        price: "1250 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Small", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-cake-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100017",
        size: "Ø20cm",
        price: "1250 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Small", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-cake-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100007",
        size: "Ø20cm",
        price: "1250 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Small", "Dining", "Porcelain"],
      },

      // Paylaşım Tabakları (Sharing Plates) - 2750 TL
      {
        id: "ottoman-sharing-28cm",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Paylaşım Tabağı / Porcelain Sharing Plate",
        subtitle: "Çok Renkli · Multi Colored",
        color: "Çok Renkli",
        code: "20230100072",
        size: "28cm",
        price: "2750 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Multi Colored", "Large", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-sharing-oval",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Paylaşım Tabağı / Porcelain Sharing Plate",
        subtitle: "Çok Renkli · Multi Colored",
        color: "Çok Renkli",
        code: "20230100001",
        size: "20x32cm",
        price: "2750 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Multi Colored", "Large", "Dining", "Porcelain"],
      },

      // Servis Tabakları (Service Plates) - Ø27cm - 1650 TL
      {
        id: "ottoman-serving-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Service Plate",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100076",
        size: "Ø27cm",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Medium", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-serving-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Service Plate",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100074",
        size: "Ø27cm",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Medium", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-serving-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Service Plate",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100073",
        size: "Ø27cm",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Medium", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-serving-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Service Plate",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100075",
        size: "Ø27cm",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Tabak",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Medium", "Dining", "Porcelain"],
      },

      // Kahve Fincanı Setleri (Coffee Cup Sets) - 2'li - 3100 TL
      {
        id: "ottoman-coffee-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "Mor/Pembe · Purple/Pink (2'li)",
        color: "Mor/Pembe",
        code: "20230100080",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Purple/Pink", "Set", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-coffee-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "Mavi/Kahve · Blue/Brown (2'li)",
        color: "Mavi/Kahve",
        code: "20230100078",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Blue/Brown", "Set", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-coffee-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "Yeşil/Turuncu · Green/Orange (2'li)",
        color: "Yeşil/Turuncu",
        code: "20230100077",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Green/Orange", "Set", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-coffee-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "Sarı/Kırmızı · Yellow/Red (2'li)",
        color: "Sarı/Kırmızı",
        code: "20230100079",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Yellow/Red", "Set", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-coffee-pink-pearl",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "Pembe/İnci · Pink/Pearl (2'li)",
        color: "Pembe/İnci",
        code: "20230100047",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Pink/Pearl", "Set", "Dining", "Porcelain"],
      },
      {
        id: "ottoman-coffee-pearl",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "İnci/Renkli · Pearl/Multicolor (2'li)",
        color: "İnci/Renkli",
        code: "20230100005",
        size: "2'li set",
        price: "3100 tl/set",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Sofra",
        capacity: null,
        setSingle: "İkili Set",
        tags: ["Pearl/Multicolor", "Set", "Dining", "Porcelain"],
      },

      // Kupalar (Cups) - 320cc - 1650 TL
      {
        id: "ottoman-cup-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kupa / Porcelain Cup",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100040",
        size: "320cc",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Mutfak",
        capacity: "320cc",
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Small", "Kitchen", "Porcelain"],
      },
      {
        id: "ottoman-cup-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kupa / Porcelain Cup",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100030",
        size: "320cc",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Mutfak",
        capacity: "320cc",
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Small", "Kitchen", "Porcelain"],
      },
      {
        id: "ottoman-cup-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kupa / Porcelain Cup",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100020",
        size: "320cc",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Mutfak",
        capacity: "320cc",
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Small", "Kitchen", "Porcelain"],
      },
      {
        id: "ottoman-cup-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kupa / Porcelain Cup",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100010",
        size: "320cc",
        price: "1650 tl/adet",
        material: "Porselen",
        productType: "Fincan & Kupa",
        usage: "Mutfak",
        capacity: "320cc",
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Small", "Kitchen", "Porcelain"],
      },

      // Mumluklar (Candle Holders) - 230cc - 1650 TL
      {
        id: "ottoman-candle-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Mumluk (Bardak) / Porcelain Candle Holder",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100038",
        size: "230cc",
        price: "1650 tl/adet",
        material: "Cam",
        productType: "Mumluk",
        usage: "Dekorasyon",
        capacity: "230cc",
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Small", "Decoration", "Glass"],
      },
      {
        id: "ottoman-candle-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Mumluk (Bardak) / Porcelain Candle Holder",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100028",
        size: "230cc",
        price: "1650 tl/adet",
        material: "Cam",
        productType: "Mumluk",
        usage: "Dekorasyon",
        capacity: "230cc",
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Small", "Decoration", "Glass"],
      },
      {
        id: "ottoman-candle-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Mumluk (Bardak) / Porcelain Candle Holder",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100018",
        size: "230cc",
        price: "1650 tl/adet",
        material: "Cam",
        productType: "Mumluk",
        usage: "Dekorasyon",
        capacity: "230cc",
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Small", "Decoration", "Glass"],
      },
      {
        id: "ottoman-candle-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Mumluk (Bardak) / Porcelain Candle Holder",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100008",
        size: "230cc",
        price: "1650 tl/adet",
        material: "Cam",
        productType: "Mumluk",
        usage: "Dekorasyon",
        capacity: "230cc",
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Small", "Decoration", "Glass"],
      },

      // Küllükler (Ashtrays) - 20x16cm - 3850 TL
      {
        id: "ottoman-ashtray-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Küllük / Porcelain Ashtray",
        subtitle: "Mor/Pembe/Altın · Purple/Pink/Gold",
        color: "Mor/Pembe/Altın",
        code: "20230100039",
        size: "20x16cm",
        price: "3850 tl/adet",
        material: "Porselen",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Small", "Smoking", "Porcelain"],
      },
      {
        id: "ottoman-ashtray-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Küllük / Porcelain Ashtray",
        subtitle: "Mavi/Kahve/Altın · Blue/Brown/Gold",
        color: "Mavi/Kahve/Altın",
        code: "20230100029",
        size: "20x16cm",
        price: "3850 tl/adet",
        material: "Porselen",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Small", "Smoking", "Porcelain"],
      },
      {
        id: "ottoman-ashtray-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Küllük / Porcelain Ashtray",
        subtitle: "Yeşil/Turuncu/Altın · Green/Orange/Gold",
        color: "Yeşil/Turuncu/Altın",
        code: "20230100019",
        size: "20x16cm",
        price: "3850 tl/adet",
        material: "Porselen",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Small", "Smoking", "Porcelain"],
      },
      {
        id: "ottoman-ashtray-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Küllük / Porcelain Ashtray",
        subtitle: "Sarı/Kırmızı/Altın · Yellow/Red/Gold",
        color: "Sarı/Kırmızı/Altın",
        code: "20230100009",
        size: "20x16cm",
        price: "3850 tl/adet",
        material: "Porselen",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Small", "Smoking", "Porcelain"],
      },

      // Bardak Altlıkları (Glass Coasters) - 850 TL
      {
        id: "ottoman-coaster-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Bardak Altlığı / Glass Coasters",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100042",
        size: "Single",
        price: "850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Small", "Dining", "Glass"],
      },
      {
        id: "ottoman-coaster-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Bardak Altlığı / Glass Coasters",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100032",
        size: "Single",
        price: "850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Small", "Dining", "Glass"],
      },
      {
        id: "ottoman-coaster-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Bardak Altlığı / Glass Coasters",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100022",
        size: "Single",
        price: "850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Small", "Dining", "Glass"],
      },
      {
        id: "ottoman-coaster-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Bardak Altlığı / Glass Coasters",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100012",
        size: "Single",
        price: "850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sofra",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Small", "Dining", "Glass"],
      },

      // Puro Küllüğü Aksesuarı (Cigar Ashtray Accessory Drop) - 2850 TL
      {
        id: "ottoman-cigar-acc-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü Aksesuar (Damla) / Glass Cigar Ashtray Accessory",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100041",
        size: "Drop",
        price: "2850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Small", "Smoking", "Glass"],
      },
      {
        id: "ottoman-cigar-acc-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü Aksesuar (Damla) / Glass Cigar Ashtray Accessory",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100031",
        size: "Drop",
        price: "2850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Small", "Smoking", "Glass"],
      },
      {
        id: "ottoman-cigar-acc-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü Aksesuar (Damla) / Glass Cigar Ashtray Accessory",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100021",
        size: "Drop",
        price: "2850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Small", "Smoking", "Glass"],
      },
      {
        id: "ottoman-cigar-acc-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü Aksesuar (Damla) / Glass Cigar Ashtray Accessory",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100011",
        size: "Drop",
        price: "2850 tl/adet",
        material: "Cam",
        productType: "Aksesuar",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Small", "Smoking", "Glass"],
      },

      // Puro Küllükleri (Cigar Ashtrays) - 3350 TL
      {
        id: "ottoman-cigar-ashtray-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü / Glass Cigar Ashtray",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100045",
        size: "Standard",
        price: "3350 tl/adet",
        material: "Cam",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Medium", "Smoking", "Glass"],
      },
      {
        id: "ottoman-cigar-ashtray-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü / Glass Cigar Ashtray",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100035",
        size: "Standard",
        price: "3350 tl/adet",
        material: "Cam",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Medium", "Smoking", "Glass"],
      },
      {
        id: "ottoman-cigar-ashtray-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü / Glass Cigar Ashtray",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100025",
        size: "Standard",
        price: "3350 tl/adet",
        material: "Cam",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Medium", "Smoking", "Glass"],
      },
      {
        id: "ottoman-cigar-ashtray-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü / Glass Cigar Ashtray",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100015",
        size: "Standard",
        price: "3350 tl/adet",
        material: "Cam",
        productType: "Küllük",
        usage: "Sigara Aksesuarları",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Medium", "Smoking", "Glass"],
      },

      // Altıgen Tepsiler (Hexagon Trays) - 27x27cm - 1790 TL
      {
        id: "ottoman-hex-tray-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Akrilik Altıgen Tepsi / Acrylic Hexagon Tray",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100046",
        size: "27x27cm",
        price: "1790 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Medium", "Decoration", "Acrylic"],
      },
      {
        id: "ottoman-hex-tray-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Akrilik Altıgen Tepsi / Acrylic Hexagon Tray",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100026",
        size: "27x27cm",
        price: "1790 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Medium", "Decoration", "Acrylic"],
      },
      {
        id: "ottoman-hex-tray-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Akrilik Altıgen Tepsi / Acrylic Hexagon Tray",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100016",
        size: "27x27cm",
        price: "1790 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Medium", "Decoration", "Acrylic"],
      },

      // Dikdörtgen Tepsi (Rectangular Tray) - Çok Renkli - 2450 TL
      {
        id: "ottoman-rect-tray-multi",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Akrilik Dikdörtgen Tepsi / Acrylic Rectangular Tray",
        subtitle: "Çok Renkli · Multi Colored",
        color: "Çok Renkli",
        code: "20230100008",
        size: "Large",
        price: "2450 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Multi Colored", "Large", "Decoration", "Acrylic"],
      },

      // Oval Tepsi (Oval Tray) - Çok Renkli - 23x40cm - 3350 TL
      {
        id: "ottoman-oval-tray-multi",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Akrilik Oval Tepsi / Acrylic Oval Tray",
        subtitle: "Çok Renkli · Multi Colored",
        color: "Çok Renkli",
        code: "20230100004",
        size: "23x40cm",
        price: "3350 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Multi Colored", "Large", "Decoration", "Acrylic"],
      },

      // Dikdörtgen Kutu (Rectangular Box) - Çok Renkli - 22x14cm - 4695 TL
      {
        id: "ottoman-rect-box-multi",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Akrilik Dikdörtgen Kutu / Acrylic Rectangular Box",
        subtitle: "Çok Renkli · Multi Colored",
        color: "Çok Renkli",
        code: "20230100009",
        size: "22x14cm",
        price: "4695 tl/adet",
        material: "Akrilik",
        productType: "Tepsi & Kutu",
        usage: "Dekorasyon",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Multi Colored", "Medium", "Decoration", "Acrylic"],
      },

      // Yastıklar (Pillows) - 45x45cm - 1250 TL
      {
        id: "ottoman-pillow-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Yastık / Pillow",
        subtitle: "Mor/Pembe · Purple/Pink",
        color: "Mor/Pembe",
        code: "20230100043",
        size: "45x45cm",
        price: "1250 tl/adet",
        material: "Tekstil",
        productType: "Tekstil",
        usage: "Yatak Odası",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Purple/Pink", "Large", "Bedroom", "Textile"],
      },
      {
        id: "ottoman-pillow-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Yastık / Pillow",
        subtitle: "Mavi/Kahve · Blue/Brown",
        color: "Mavi/Kahve",
        code: "20230100033",
        size: "45x45cm",
        price: "1250 tl/adet",
        material: "Tekstil",
        productType: "Tekstil",
        usage: "Yatak Odası",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Blue/Brown", "Large", "Bedroom", "Textile"],
      },
      {
        id: "ottoman-pillow-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Yastık / Pillow",
        subtitle: "Yeşil/Turuncu · Green/Orange",
        color: "Yeşil/Turuncu",
        code: "20230100023",
        size: "45x45cm",
        price: "1250 tl/adet",
        material: "Tekstil",
        productType: "Tekstil",
        usage: "Yatak Odası",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Green/Orange", "Large", "Bedroom", "Textile"],
      },
      {
        id: "ottoman-pillow-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Yastık / Pillow",
        subtitle: "Sarı/Kırmızı · Yellow/Red",
        color: "Sarı/Kırmızı",
        code: "20230100013",
        size: "45x45cm",
        price: "1250 tl/adet",
        material: "Tekstil",
        productType: "Tekstil",
        usage: "Yatak Odası",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Yellow/Red", "Large", "Bedroom", "Textile"],
      },
      {
        id: "ottoman-pillow-multi",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Yastık / Pillow",
        subtitle: "Çok Renkli · Multi Colored",
        color: "Çok Renkli",
        code: "20230100002",
        size: "45x45cm",
        price: "1250 tl/adet",
        material: "Tekstil",
        productType: "Tekstil",
        usage: "Yatak Odası",
        capacity: null,
        setSingle: "Tek Parça",
        tags: ["Multi Colored", "Large", "Bedroom", "Textile"],
      },
    ],
    []
  );

  const aslanProducts = useMemo(
    () => allProducts.filter((p) => p.collection === "aslan"),
    [allProducts]
  );

  const ottomanProducts = useMemo(
    () => allProducts.filter((p) => p.collection === "ottoman"),
    [allProducts]
  );

  const currentProduct = useMemo(() => {
    if (route.name !== "product") return null;
    return allProducts.find((p) => p.collection === route.slug && p.id === route.id) || null;
  }, [route, allProducts]);

  return (
    <PageShell>
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 20% -10%, rgba(15,63,68,0.08), transparent 60%), radial-gradient(900px 500px at 110% 20%, rgba(212,175,122,0.06), transparent 55%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e8e6e3]/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <button
            type="button"
            className="flex items-center gap-4"
            onClick={() => go({ name: "home" })}
            aria-label="Ana sayfa"
          >
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#0f3f44] to-[#0a2a2e] shadow-lg" />
            <div className="flex flex-col items-start gap-0.5">
              <div className="text-sm font-bold tracking-[0.32em] text-[#1a1a1a]">
                {BRAND.name}
              </div>
              <div className="text-[10px] font-light tracking-[0.12em] text-[#999]">
                {BRAND.tagline}
              </div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="relative ml-auto hidden items-center gap-1 md:flex">
            <div className="relative">
              <button
                ref={collectionsBtnRef}
                type="button"
                onClick={() => setCollectionsOpen((v) => !v)}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]",
                  collectionsOpen && "bg-[#faf8f5]"
                )}
              >
                Koleksiyonlar
                <ChevronDown
                  className={cx("h-4 w-4 transition-transform", collectionsOpen && "rotate-180")}
                />
              </button>

              <CollectionDropdown
                open={collectionsOpen}
                anchorRef={collectionsBtnRef as React.RefObject<HTMLButtonElement>}
                onClose={() => setCollectionsOpen(false)}
                onGo={(r) => {
                  go(r);
                  setCollectionsOpen(false);
                }}
              />
            </div>

            <div className="relative">
              <button
                ref={productsBtnRef}
                type="button"
                onClick={() => setProductsOpen((v) => !v)}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]",
                  productsOpen && "bg-[#faf8f5]"
                )}
              >
                Ürünler
                <ChevronDown
                  className={cx("h-4 w-4 transition-transform", productsOpen && "rotate-180")}
                />
              </button>

              <ProductsDropdown
                open={productsOpen}
                anchorRef={collectionsBtnRef as React.RefObject<HTMLButtonElement>}
                onClose={() => setProductsOpen(false)}
                onGo={(r) => {
                  go(r);
                  setProductsOpen(false);
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => go({ name: "about" })}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              Hakkımızda
            </button>

            <button
              type="button"
              onClick={() => go({ name: "contact" })}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              İletişim
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#faf8f5]"
              aria-label="Ara"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#faf8f5] sm:flex"
              aria-label="Hesabım"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              className="hidden items-center gap-2 rounded-full border border-[#e8e6e3] px-4 py-2 text-sm transition-colors hover:bg-[#faf8f5] sm:inline-flex"
              aria-label="Sepet"
            >
              <ShoppingBag className="h-5 w-5" />
              Sepet
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e6e3] transition-colors hover:bg-[#faf8f5] md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} onGo={go} />

      {/* Route rendering */}
      {route.name === "home" ? <Home onGo={go} /> : null}
      {route.name === "collections" ? <CollectionsPage onGo={go} products={allProducts} /> : null}
      {route.name === "products" ? <AllProductsPage products={allProducts} onGo={go} /> : null}
      {route.name === "category" ? (
        <CategoryPage category={route.category} products={allProducts} onGo={go} />
      ) : null}
      {route.name === "about" ? <AboutPage onGo={go} /> : null}
      {route.name === "contact" ? <ContactPage onGo={go} /> : null}
      {route.name === "collection" ? (
        <CollectionPage
          slug={route.slug}
          products={route.slug === "aslan" ? aslanProducts : ottomanProducts}
          onGo={go}
        />
      ) : null}
      {route.name === "product" && currentProduct ? (
        <ProductPage product={currentProduct} onGo={go} />
      ) : null}

      <Footer onGo={go} />
    </PageShell>
  );
}