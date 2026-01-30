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
import { allProducts } from "../data/products";
import { BRAND, ASSETS } from "@/constants/brand";
import { LuxuryBadge, FeatureCard, CollectionCard, ProductCard } from "@/components/Cards";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { groupProductsByVariants } from "@/utils/groupProducts";
import ProductDetail from "@/components/ProductDetail";


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
    } else {
      // Default "recommended" sort: Multi-color products first
      filtered.sort((a, b) => {
        const variantsA = a.variants?.length || 1;
        const variantsB = b.variants?.length || 1;
        return variantsB - variantsA;
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
                {displayedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    productIndex={startIndex + index}
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
    } else {
      // Default "recommended" sort: Multi-color products first
      filtered.sort((a, b) => {
        const variantsA = a.variants?.length || 1;
        const variantsB = b.variants?.length || 1;
        return variantsB - variantsA;
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
                {displayedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    productIndex={startIndex + index}
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
    } else if (sortBy === "newest") {
      // Newest sort logic (can be customized)
    } else {
      // Default "recommended" sort: Multi-color products first
      filtered.sort((a, b) => {
        const variantsA = a.variants?.length || 1;
        const variantsB = b.variants?.length || 1;
        // More variants = higher priority (shown first)
        return variantsB - variantsA;
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
                {displayedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    productIndex={startIndex + index}
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
function ProductPage({ 
  product, 
  onGo, 
  groupedProducts 
}: { 
  product: any; 
  onGo: (r: any) => void;
  groupedProducts: any[];
}) {
  // Get related products (same collection, different product)
  const relatedProducts = useMemo(() => {
    return groupedProducts
      .filter(p => 
        p.collection === product.collection && 
        p.id !== product.id
      )
      .slice(0, 4);
  }, [product, groupedProducts]);

  // Handle related product click
  const handleRelatedProductClick = (productId: string) => {
    // Find the clicked product
    const clickedProduct = groupedProducts.find(p => p.id === productId);
    if (clickedProduct) {
      // Navigate to that product
      onGo({ 
        name: "product", 
        slug: clickedProduct.collection, 
        id: clickedProduct.id 
      });
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <ProductDetail 
      product={product}
      onGoBack={() => onGo({ name: "collection", slug: product.collection })}
      relatedProducts={relatedProducts}
      onProductClick={handleRelatedProductClick}
    />
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

  // Group products by variants (same product, different colors)
  const groupedProducts = useMemo(() => {
    return groupProductsByVariants(allProducts);
  }, []);

  const aslanProducts = useMemo(
    () => groupedProducts.filter((p) => p.collection === "aslan"),
    [groupedProducts]
  );

  const ottomanProducts = useMemo(
    () => groupedProducts.filter((p) => p.collection === "ottoman"),
    [groupedProducts]
  );

  const currentProduct = useMemo(() => {
    if (route.name !== "product") return null;
    
    // Find the grouped product that contains this variant ID
    const grouped = groupedProducts.find(p =>
      p.variants.some((v: any) => v.id === route.id)
    );
    
    if (!grouped) return null;
    
    // Find which variant was clicked
    const variantIndex = grouped.variants.findIndex((v: any) => v.id === route.id);
    
    // Return product with selected variant index
    return {
      ...grouped,
      selectedVariantIndex: variantIndex >= 0 ? variantIndex : 0,
    };
  }, [route, groupedProducts]);

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

      <Navbar go={go} />

      {/* Route rendering */}
      {route.name === "home" ? <Home onGo={go} /> : null}
      {route.name === "collections" ? <CollectionsPage onGo={go} products={groupedProducts} /> : null}
      {route.name === "products" ? <AllProductsPage products={groupedProducts} onGo={go} /> : null}
      {route.name === "category" ? (
        <CategoryPage category={route.category} products={groupedProducts} onGo={go} />
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
        <ProductPage product={currentProduct} onGo={go} groupedProducts={groupedProducts} />
      ) : null}

      <Footer onGo={go} />
    </PageShell>
  );
}