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
  | { name: "collections" }
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
    case "collections":
      window.location.hash = "#/koleksiyonlar";
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
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
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

        <div className="mt-3 border-t border-[#e8e6e3] pt-3">
          <button
            onClick={() => {
              onGo({ name: "collections" });
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#0f3f44] transition-colors hover:bg-[#faf8f5]"
          >
            Tüm Koleksiyonlar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
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

// Collection detail page
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

  return (
    <main>
      {/* Collection Hero */}
      <section className="relative h-[60vh] overflow-hidden bg-[#0f3f44]">
        <img
          src={collection.cover}
          alt={collection.title}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-7xl px-6 pb-16">
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

      {/* Products Grid */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-center justify-between">
            <div className="text-sm text-[#666]">{products.length} ürün</div>
            <select className="rounded-full border border-[#e8e6e3] bg-white px-4 py-2 text-sm outline-none focus:border-[#0f3f44]">
              <option>Önerilen</option>
              <option>Fiyat: Düşükten Yükseğe</option>
              <option>Fiyat: Yüksekten Düşüğe</option>
              <option>Yeni Ürünler</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onGo({ name: "product", slug, id: product.id })}
              />
            ))}
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
                Sanat ve zanaat tutkusuyla başlayan bir yolculuk
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
            className="prose prose-lg max-w-none"
          >
            <p className="text-[#666] leading-relaxed">
              Jonquil, 2016 yılında porselen sanatına duyduğumuz tutku ile kuruldu. Her parça,
              deneyimli zanaatkarlarımız tarafından özenle tasarlanıyor ve üretiliyor.
            </p>

            <p className="text-[#666] leading-relaxed mt-6">
              Misyonumuz, modern yaşamın estetiğini klasik el işçiliği ile buluşturarak,
              sofranıza sanat eserlerini getirmek. Her ürünümüz, kalite ve detaya gösterilen
              özenin bir yansımasıdır.
            </p>

            <div className="grid gap-8 md:grid-cols-3 not-prose mt-16">
              <div className="text-center">
                <div className="mb-3 text-4xl font-light text-[#d4af7a]">2016</div>
                <div className="text-sm text-[#666]">Kuruluş Yılı</div>
              </div>
              <div className="text-center">
                <div className="mb-3 text-4xl font-light text-[#d4af7a]">500+</div>
                <div className="text-sm text-[#666]">Mutlu Müşteri</div>
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

// Footer component
function Footer() {
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
                <a href="#" className="hover:text-[#0f3f44]">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0f3f44]">
                  İletişim
                </a>
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
  const collectionsBtnRef = useRef<HTMLButtonElement>(null);

  // Product data
  const allProducts = useMemo(
    () => [
      // Aslan Collection
      {
        id: "aslan-dinner-set",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Yemek Takımı / Porcelain Dinner Set",
        subtitle: "24 Parça",
        color: "Beyaz · White",
        code: "20230100001",
        size: "24 parça",
        price: "4850 tl/set",
      },
      {
        id: "aslan-plate-set",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Tabak Seti / Porcelain Plate Set",
        subtitle: "6'lı",
        color: "Beyaz · White",
        code: "20230100002",
        size: "Ø27cm",
        price: "1650 tl/set",
      },
      // Ottoman Collection  
      {
        id: "ottoman-sharing-plate",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Paylaşım Tabağı / Porcelain Sharing Plate",
        subtitle: "Çok Renkli | Multi Colored",
        color: "Çok Renkli · Multi Colored",
        code: "20230100001",
        size: "20x32cm",
        price: "2750 tl/adet",
      },
      {
        id: "ottoman-serving-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Mor/Pembe | Purple/Pink",
        color: "Mor/Pembe · Purple/Pink",
        code: "20230100076",
        size: "Ø27cm",
        price: "1650 tl/adet",
      },
      {
        id: "ottoman-coffee-set",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "2'li Set",
        color: "Çeşitli Renkler",
        code: "20230100080",
        size: "2'li set",
        price: "3100 tl/set",
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
                anchorRef={collectionsBtnRef}
                onClose={() => setCollectionsOpen(false)}
                onGo={(r) => {
                  go(r);
                  setCollectionsOpen(false);
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

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]"
            >
              İletişim
            </a>
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
      {route.name === "about" ? <AboutPage onGo={go} /> : null}
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

      <Footer />
    </PageShell>
  );
}