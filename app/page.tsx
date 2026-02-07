"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Gift,
  Mail,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ASSETS } from "@/constants/brand";
import { LuxuryBadge, FeatureCard, CollectionCard, ProductCard } from "@/components/Cards";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function JonquilHomepage() {
  const { products: allProducts } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [ASSETS.hero1, ASSETS.hero2, ASSETS.hero3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 20% -10%, rgba(15,63,68,0.08), transparent 60%), radial-gradient(900px 500px at 110% 20%, rgba(212,175,122,0.06), transparent 55%)",
        }}
      />

      <Navbar />

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
                <Link
                  href="/urunler"
                  className="rounded-full bg-white px-8 py-4 text-[14px] font-semibold tracking-wide text-[#0f3f44] transition-all hover:bg-[#d4af7a] hover:text-white"
                >
                  Koleksiyonları Keşfet
                </Link>
                <Link
                  href="/hakkimizda"
                  className="rounded-full border-2 border-white bg-transparent px-8 py-4 text-[14px] font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#0f3f44]"
                >
                  Hikayemiz
                </Link>
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
        <section id="koleksiyonlar" className="bg-white py-20">
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
              <Link href="/koleksiyon/aslan">
                <CollectionCard
                  image={ASSETS.aslanCover}
                  badge="CLASSIC DESIGN"
                  title="Aslan Koleksiyonu"
                  desc="El yapımı porselen aslan figürlü klasik tasarım"
                  onClick={() => {}}
                />
              </Link>
              <Link href="/koleksiyon/ottoman">
                <CollectionCard
                  image={ASSETS.ottomanCover}
                  badge="COLORFUL PATTERNS"
                  title="Ottoman Koleksiyonu"
                  desc="Geleneksel Osmanlı motifleriyle bezeli renkli desenler"
                  onClick={() => {}}
                />
              </Link>
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
                icon={<BadgeCheck className="h-8 w-8" />}
                title="El Yapımı Üretim"
                desc="Her ürün, deneyimli zanaatkarlar tarafından özenle üretilir ve kalite kontrolünden geçer."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8" />}
                title="Premium Malzeme"
                desc="En kaliteli porselen ve malzemeler kullanılarak uzun ömürlü ürünler sunuyoruz."
              />
              <FeatureCard
                icon={<Gift className="h-8 w-8" />}
                title="Özel Paketleme"
                desc="Hediye vermek için ideal, şık kutularda özenle paketlenmiş ürünler."
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
              <Link
                href="/hakkimizda"
                className="inline-block rounded-full border-2 border-white bg-transparent px-8 py-6 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#0f3f44]"
              >
                Hikayemizi Keşfedin
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <div className="mb-4 font-light tracking-widest text-[#d4af7a]">EN SEVİLENLER</div>
              <h2 className="mb-4 font-serif text-4xl font-light text-[#1a1a1a] md:text-5xl">
                Çok Satanlar
              </h2>
              <p className="mx-auto max-w-2xl text-[#666]">
                Müşterilerimizin favorisi olan en popüler ürünlerimize göz atın.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {allProducts.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/urun/${product.id}`}>
                    <ProductCard
                      product={product}
                      onClick={() => {}}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Gallery Section */}
        <section className="bg-gradient-to-b from-[#faf8f5] to-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <div className="mb-4 font-light tracking-widest text-[#d4af7a]">GÖZ ATIN</div>
              <h2 className="mb-4 font-serif text-4xl font-light text-[#1a1a1a] md:text-5xl">
                Fotoğraf Galerisi
              </h2>
              <p className="mx-auto max-w-2xl text-[#666]">
                Jonquil dünyasından ilham verici anlar ve detaylar.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <motion.div
                className="col-span-2 row-span-2 overflow-hidden rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <img src="/images/products/GENEL FOTOLAR/Header-1.jpg" alt="Gallery image 1" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </motion.div>
              <motion.div
                className="overflow-hidden rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <img src="/images/products/GENEL FOTOLAR/Header-2.jpg" alt="Gallery image 2" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </motion.div>
              <motion.div
                className="overflow-hidden rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <img src="/images/products/GENEL FOTOLAR/Header-3.jpg" alt="Gallery image 3" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </motion.div>
              <motion.div
                className="overflow-hidden rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <img src="/images/products/GENEL FOTOLAR/Aslan Temsil.jpg" alt="Gallery image 4" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </motion.div>
              <motion.div
                className="overflow-hidden rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <img src="/images/products/GENEL FOTOLAR/Ottoman Temsil.jpg" alt="Gallery image 5" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </motion.div>
            </div>
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
              <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
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

      <Footer />
    </div>
  );
}
