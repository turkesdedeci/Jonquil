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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BRAND = {
  name: "JONQUIL",
  tagline: "Porselen · Tasarım Objeleri",
  bg: "#f3f2ee",
  paper: "#fbfaf7",
  surface: "#ffffff",
  surface2: "#f8f7f3",
  ink: "#111111",
  inkSoft: "rgba(17,17,17,0.72)",
  border: "rgba(17,17,17,0.10)",
  hairline: "rgba(15,63,68,0.16)",
  accent: "#0f3f44",
};

const ASSETS = {
  hero1: "https://i.hizliresim.com/optbare.png",
  hero2: "https://i.hizliresim.com/etb6cis.png",
  hero3: "https://i.hizliresim.com/sdsugmo.png",
  aslanCover:
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=2400&q=85",
  ottomanCover:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2400&q=85",
  packaging:
    "https://images.unsplash.com/photo-1520975682031-ae7cfd3f7a4a?auto=format&fit=crop&w=2400&q=85",
  objects:
    "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=2400&q=85",
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
  if (route.name === "home") {
    window.location.hash = "#";
    return;
  }
  if (route.name === "about") {
    window.location.hash = "#/hakkimizda";
    return;
  }
  if (route.name === "collection") {
    window.location.hash = `#/koleksiyon/${route.slug}`;
    return;
  }
  window.location.hash = `#/urun/${route.slug}/${route.id}`;
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
  const [route, setRoute] = useState<Route>(() => (typeof window === "undefined" ? { name: "home" } : parseHash()));

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = (r: Route) => setHash(r);

  return { route, go };
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border bg-[var(--paper)]/70 px-3 py-1 text-xs text-neutral-700 backdrop-blur"
      style={{ borderColor: "var(--hairline)" }}
    >
      {children}
    </span>
  );
}

function IconStat({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
        <div className="mt-1 text-xs leading-5 text-neutral-600">{desc}</div>
      </div>
    </div>
  );
}

function InstagramTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-[var(--surface)] shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
      style={{ borderColor: "var(--border)" }}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
    </div>
  );
}

function MobileNav({
  open,
  onClose,
  onGo,
}: {
  open: boolean;
  onClose: () => void;
  onGo: (r: Route) => void;
}) {
  const items = [
    { label: "Koleksiyonlar", type: "collections" as const },
    { label: "Hakkında", type: "link" as const },
    { label: "İletişim", type: "link" as const },
  ];

  return (
    <div
      className={cx("fixed inset-0 z-50 transition", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cx("absolute inset-0 bg-black/35 transition", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        className={cx(
          "absolute right-0 top-0 h-full w-[88%] max-w-sm bg-[var(--surface)] shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b p-5" style={{ borderBottomColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full" style={{ background: BRAND.accent }} />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">{BRAND.name}</div>
              <div className="text-xs text-neutral-500">{BRAND.tagline}</div>
            </div>
          </div>
          <Button variant="ghost" className="rounded-full" onClick={onClose} aria-label="Menüyü kapat">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-5">
          <div className="grid gap-2 text-sm">
            {items.map((it) => (
              <React.Fragment key={it.label}>
                {it.type === "collections" ? (
                  <div
                    className="rounded-2xl border bg-[var(--surface)] px-4 py-3"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{it.label}</span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </div>
                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onGo({ name: "collection", slug: "aslan" });
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-2xl border bg-[var(--surface)] px-4 py-3 text-left hover:bg-black/5"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="font-medium">Aslan Koleksiyonu</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onGo({ name: "collection", slug: "ottoman" });
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-2xl border bg-[var(--surface)] px-4 py-3 text-left hover:bg-black/5"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="font-medium">Ottoman</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center justify-between rounded-2xl border bg-[var(--surface)] px-4 py-3 hover:bg-black/5"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="font-medium">{it.label}</span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </a>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-6">
            <Button
              className="w-full rounded-full text-white"
              style={{ background: BRAND.accent }}
              onClick={() => {
                onGo({ name: "collection", slug: "aslan" });
                onClose();
              }}
            >
              Koleksiyonları keşfet <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSlider({ images, className }: { images: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className={cx("relative h-full w-full overflow-hidden", className)}>
      <div className="flex h-full w-full transition-transform duration-500" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="relative h-full w-full flex-shrink-0">
            <img src={src} alt="Jonquil" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-black/5 to-transparent" />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/12 to-transparent" />

      <div className="absolute inset-x-0 bottom-6 flex items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slayt ${i + 1}`}
              className={cx("h-2.5 w-2.5 rounded-full border transition", i === index ? "bg-white" : "bg-white/35")}
              style={{ borderColor: "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-10 rounded-full border-white/25 bg-white/10 p-0 text-white backdrop-blur hover:bg-white/15"
            onClick={prev}
            aria-label="Önceki"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-10 rounded-full border-white/25 bg-white/10 p-0 text-white backdrop-blur hover:bg-white/15"
            onClick={next}
            aria-label="Sonraki"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AboutPage({ onGo }: { onGo: (r: Route) => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-28">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-6 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Hakkımızda</h1>
        </div>

        <Button variant="outline" className="rounded-full border-black/15" onClick={() => onGo({ name: "home" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Ana sayfa
        </Button>
      </div>

      <div className="mt-12 space-y-10 text-[15px] leading-7 text-neutral-600">
        <p>
          Jonquil, gündelik ritüellerin etrafında şekillenen porselen ve tasarım objeleri üretir.
          Her parça; sofrada, yaşam alanında ve zamanla kurulan ilişkide kalıcı olmayı hedefler.
          Markanın çıkış noktası, objenin yalnızca işlevini değil, kullanıldığı anı da düşünmektir.
          Sakin bir sabah, uzun bir sofra, paylaşılan bir an… Jonquil ürünleri bu sahnelerin doğal bir parçası olarak tasarlanır.
        </p>

        <p>
          Koleksiyonlarımız; güçlü desenler, dengeli renk kullanımı ve net formlar üzerinden ilerler.
          Dekoratif olmaktan çok yaşayan, trendlerden çok zamansız bir dil benimser.
          Her ürün; ölçüsü, oranı ve yüzeyiyle bilinçli bir tasarım kararının sonucudur.
        </p>

        <p>
          Üretim sürecinde kalite, tutarlılık ve detay önceliklidir.
          Porselenin karakteri korunur; altın detaylar, renkler ve yüzeyler göze batmadan var olur.
          Jonquil’de lüks, gösterişli olmaktan değil, tutarlılıktan doğar.
          Çünkü iyi tasarım, zamana karşı değil, zamanla birlikte yaşar.
        </p>
      </div>
    </section>
  );
}



function CollectionDropdown({
  open,
  anchorRef,
  onClose,
  onGo,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onGo: (r: Route) => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onDown = (e: MouseEvent) => {
      const a = anchorRef.current;
      const p = panelRef.current;
      if (!a || !p) return;

      const t = e.target as Node;
      if (a.contains(t) || p.contains(t)) return;
      onClose();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 top-full mt-2 w-[320px] overflow-hidden rounded-3xl border bg-[var(--surface)] shadow-[0_22px_70px_rgba(0,0,0,0.14)]"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                onGo({ name: "collection", slug: "aslan" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left hover:bg-black/5"
            >
              <div>
                <div className="text-sm font-semibold text-neutral-900">Aslan Koleksiyonu</div>
                <div className="mt-0.5 text-xs text-neutral-500">Güçlü desenler · karakterli yüzeyler</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => {
                onGo({ name: "collection", slug: "ottoman" });
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left hover:bg-black/5"
            >
              <div>
                <div className="text-sm font-semibold text-neutral-900">Ottoman</div>
                <div className="mt-0.5 text-xs text-neutral-500">Canlı renkler · hikâyeli sahneler</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type Product = {
  id: string;
  collection: "aslan" | "ottoman";
  family: string;
  title: string;
  subtitle: string;
  color: string;
  code: string;
  size: string;
  price: string;
};

function ProductCard({ product, onGo }: { product: Product; onGo: (r: Route) => void }) {
  const gradient = product.collection === "aslan" ? "from-[#e8d7cf] to-[#f4eee8]" : "from-[#d7e6ef] to-[#f1f6fb]";

  return (
    <Card
      className="overflow-hidden rounded-3xl border bg-[var(--surface)] shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="text-xs font-semibold tracking-[0.36em] text-neutral-800">{product.family}</div>
          <span
            className="inline-flex items-center rounded-full border bg-[var(--paper)]/70 px-3 py-1 text-xs text-neutral-700"
            style={{ borderColor: "var(--hairline)" }}
          >
            {product.color}
          </span>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-[210px_1fr]">
          <div className={cx("h-[170px] w-full overflow-hidden rounded-3xl bg-gradient-to-br", gradient)} />

          <div className="min-w-0">
            <div className="text-lg font-semibold text-neutral-900">{product.title}</div>
            <div className="mt-2 text-sm text-neutral-700">{product.subtitle}</div>

            <div className="mt-3 grid gap-1 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-neutral-500">Kod</span>
                <span className="font-medium text-neutral-900">{product.code}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-neutral-500">Ölçü</span>
                <span className="font-medium text-neutral-900">{product.size}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="text-lg font-semibold" style={{ color: BRAND.accent }}>
                {product.price}
              </div>
              <Button
                className="rounded-full text-white"
                style={{ background: BRAND.accent }}
                onClick={() => onGo({ name: "product", slug: product.collection, id: product.id })}
              >
                İncele <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
      style={
        {
          "--bg": BRAND.bg,
          "--paper": BRAND.paper,
          "--surface": BRAND.surface,
          "--surface2": BRAND.surface2,
          "--ink": BRAND.ink,
          "--inkSoft": BRAND.inkSoft,
          "--border": BRAND.border,
          "--hairline": BRAND.hairline,
          "--hairlineAccent": "rgba(15,63,68,0.22)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

function Home({ onGo }: { onGo: (r: Route) => void }) {
  const collections = useMemo(
    () => [
      {
        title: "Aslan Koleksiyonu",
        subtitle: "Güçlü desenler · karakterli yüzeyler",
        image: ASSETS.aslanCover,
        cta: "Aslan’ı keşfet",
        slug: "aslan" as const,
      },
      {
        title: "Ottoman",
        subtitle: "Canlı renkler · hikâyeli sahneler",
        image: ASSETS.ottomanCover,
        cta: "Ottoman’ı keşfet",
        slug: "ottoman" as const,
      },
    ],
    []
  );



  const heroSlides = useMemo(() => [ASSETS.hero1, ASSETS.hero2, ASSETS.hero3], []);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div
          className="grid gap-6 overflow-hidden rounded-[32px] border bg-[var(--surface)] shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:grid-cols-12"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="relative md:col-span-5">
            <div className="h-full p-8 md:p-12">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                <div className="flex flex-wrap gap-2">
                  <Pill>
                    <BadgeCheck className="h-4 w-4" /> Koleksiyonluk
                  </Pill>
                </div>

                <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Sakin sabahlar,
                  <br /> uzun sofralar için.
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6" style={{ color: BRAND.inkSoft }}>
                  Günlük ritüellerden doğan porselen ve tasarım objeleri. Cesur renk hikâyeleri ve sofraya ait parçalar.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className="rounded-full text-white"
                    style={{ background: BRAND.accent }}
                    onClick={() => onGo({ name: "collections" })}
                  >
                    Koleksiyonları keşfet <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-10 h-px w-16" style={{ background: "var(--hairlineAccent)" }} />
              </motion.div>
            </div>
          </div>

          <div className="relative h-[305px] md:col-span-7 md:h-[565px]">
            <HeroSlider images={heroSlides} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid gap-4 md:grid-cols-3">
          <IconStat icon={<ShieldCheck className="h-5 w-5" />} title="Güvenli ödeme" desc="Net politikalar, güvenli ödeme süreci." />
          <IconStat icon={<Truck className="h-5 w-5" />} title="Şeffaf gönderim" desc="Teslimat ve takip bilgileri açıkça görünür." />
          <IconStat icon={<Gift className="h-5 w-5" />} title="Hediye gönderimine hazır" desc="Koruyucu, özenli ve sunuma uygun paketleme." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
            <h2 className="text-3xl font-semibold tracking-tight">Koleksiyonlar</h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">Bir gardırop gibi: tek başına güçlü, birlikte daha iyi.</p>
            <p className="mt-1 max-w-xl text-xs text-neutral-500">Her parça kendi başına durur; yan yana geldiklerinde hikâye kurar.</p>
            <div className="mt-3 h-px w-24" style={{ background: "var(--hairlineAccent)" }} />
          </div>
          <button
            type="button"
            onClick={() => onGo({ name: "collection", slug: "aslan" })}
            className="hidden text-sm font-medium text-neutral-700 hover:text-neutral-900 md:inline-flex"
          >
            Tüm koleksiyonlar <ChevronRight className="ml-1 h-4 w-4 opacity-60" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((c) => (
            <Card
              key={c.title}
              className="group overflow-hidden rounded-3xl border bg-[var(--surface)] shadow-[0_16px_50px_rgba(0,0,0,0.06)] transition hover:shadow-[0_22px_70px_rgba(0,0,0,0.10)]"
              style={{ borderColor: "var(--border)" }}
            >
              <button type="button" onClick={() => onGo({ name: "collection", slug: c.slug })} className="relative block w-full text-left">
                <img
                  src={c.image}
                  alt={c.title}
                  referrerPolicy="no-referrer"
                  className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-lg font-semibold text-white">{c.title}</div>
                  <div className="mt-1 text-sm text-white/80">{c.subtitle}</div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
                    {c.cta} <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            </Card>
          ))}
        </div>
        {/* Mini “Tüm ürünlere göz at” */}
        <div className="mt-14">
        
  ...
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-12 md:items-stretch">
          <div className="md:col-span-6">
            <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Satın almayı kolaylaştırıyoruz.</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Instagram’daki en sık soru belli: “Bunu nasıl satın alabilirim?” Bu site, o soruyu 1–2 adımda yanıtlamak için tasarlandı.
            </p>

            <div className="mt-8 grid gap-4">
              <div
                className="h-full rounded-3xl border bg-[var(--surface)] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Online satın al</div>
                  <span className="text-xs text-neutral-500">Önerilen</span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">Tüm katalog, stok görünürlüğü, güvenli ödeme, kargo.</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Button className="rounded-full text-white" style={{ background: BRAND.accent }}>
                    Mağazaya git <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900" onClick={(e) => e.preventDefault()}>
                    Kargo ve iade
                  </a>
                </div>

                <div className="mt-6 h-px w-full" style={{ background: "var(--border)" }} />

                <div className="mt-5 grid gap-3">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex items-start justify-between gap-4 rounded-2xl px-2 py-2 hover:bg-black/5"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-neutral-700" />
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">Satış noktaları</div>
                        <div className="mt-0.5 text-xs text-neutral-600">Partner mağazalar ve satış noktaları.</div>
                      </div>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 opacity-60" />
                  </a>

                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex items-start justify-between gap-4 rounded-2xl px-2 py-2 hover:bg-black/5"
                  >
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-neutral-700" />
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">Destekle sipariş</div>
                        <div className="mt-0.5 text-xs text-neutral-600">Hediye, toplu sipariş veya seçim desteği.</div>
                      </div>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-6">
            <img
              src={ASSETS.packaging}
              alt="Özenli hediye paketleme"
              referrerPolicy="no-referrer"
              className="h-[512px] w-full rounded-[32px] object-cover shadow-[0_18px_60px_rgba(0,0,0,0.10)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
            <h2 className="text-3xl font-semibold tracking-tight">Atölyeden</h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-600">Sofra sahneleri, yaşam anları ve yeni parçalar — Jonquil dünyası.</p>
          </div>
          <a href="#" className="hidden text-sm font-medium text-neutral-700 hover:text-neutral-900 md:inline-flex" onClick={(e) => e.preventDefault()}>
            Instagram’da takip et <ChevronRight className="ml-1 h-4 w-4 opacity-60" />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <InstagramTile src={ASSETS.hero1} alt="Instagram seçili" />
          </div>
          <div className="grid gap-4 md:col-span-6 md:grid-cols-2">
            <InstagramTile src={ASSETS.hero2} alt="Instagram" />
            <InstagramTile src={ASSETS.hero3} alt="Instagram" />
            <InstagramTile src={ASSETS.aslanCover} alt="Instagram" />
            <InstagramTile src={ASSETS.objects} alt="Instagram" />
          </div>
        </div>

        <div className="mt-8 md:hidden">
          <a href="#" className="inline-flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900" onClick={(e) => e.preventDefault()}>
            Instagram’da takip et <ChevronRight className="ml-1 h-4 w-4 opacity-60" />
          </a>
        </div>
      </section>

      <section className="bg-[var(--paper)]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div
            className="grid gap-6 rounded-[32px] border p-8 text-white shadow-[0_22px_80px_rgba(0,0,0,0.18)] md:grid-cols-12 md:items-center md:p-12"
            style={{ background: BRAND.accent, borderColor: "rgba(255,255,255,0.18)" }}
          >
            <div className="md:col-span-7">
              <h3 className="text-2xl font-semibold tracking-tight">Yeni parçalar, sessizce.</h3>
              <p className="mt-3 max-w-xl text-sm text-white/80">Erken erişim, sınırlı adetler ve hediye seçkileri.</p>
            </div>
            <div className="md:col-span-5">
              <div className="flex gap-2 rounded-full bg-white p-2">
                <input className="h-10 w-full rounded-full bg-transparent px-4 text-sm text-neutral-900 outline-none" placeholder="E-posta adresi" />
                <Button className="h-10 rounded-full bg-black text-white hover:bg-neutral-800">Katıl</Button>
              </div>
              <div className="mt-2 text-xs text-white/70">Spam yok. İstediğin zaman çıkabilirsin.</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function CollectionsPage({ onGo, products }: { onGo: (r: Route) => void; products: Product[] }) {
  const collections = useMemo(
    () => [
      {
        title: "Aslan Koleksiyonu",
        subtitle: "Güçlü desenler · karakterli yüzeyler",
        image: ASSETS.aslanCover,
        cta: "Aslan’ı keşfet",
        slug: "aslan" as const,
      },
      {
        title: "Ottoman",
        subtitle: "Canlı renkler · hikâyeli sahneler",
        image: ASSETS.ottomanCover,
        cta: "Ottoman’ı keşfet",
        slug: "ottoman" as const,
      },
    ],
    []
  );

    const [q, setQ] = useState("");
    const [filter, setFilter] = useState<"all" | "aslan" | "ottoman">("all");

    const filtered = useMemo(() => {
      const list = products ?? [];
      const qq = q.trim().toLowerCase();
      return list.filter((p) => {
        const okCollection = filter === "all" ? true : p.collection === filter;
        const okQuery =
          !qq ||
          `${p.title} ${p.subtitle} ${p.code} ${p.family} ${p.color}`
          .toLowerCase()
          .includes(qq);
        return okCollection && okQuery;
      });
    }, [products, q, filter]);

    // mini vitrin: 12 gösterelim (istersen 18 yaparız)
    const featured = useMemo(() => filtered.slice(0, 12), [filtered]);


  return (
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
          <h1 className="text-3xl font-semibold tracking-tight">Koleksiyonlar</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Her koleksiyon ayrı bir renk hikâyesi. Parçalar yan yana geldiklerinde sahne kurar.
          </p>
          <div className="mt-3 h-px w-24" style={{ background: "var(--hairlineAccent)" }} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-full border-black/15" onClick={() => onGo({ name: "home" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Ana sayfa
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {collections.map((c) => (
          <Card
            key={c.title}
            className="group overflow-hidden rounded-3xl border bg-[var(--surface)] shadow-[0_16px_50px_rgba(0,0,0,0.06)] transition hover:shadow-[0_22px_70px_rgba(0,0,0,0.10)]"
            style={{ borderColor: "var(--border)" }}
          >
            <button type="button" onClick={() => onGo({ name: "collection", slug: c.slug })} className="relative block w-full text-left">
              <img
                src={c.image}
                alt={c.title}
                referrerPolicy="no-referrer"
                className="h-[520px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-sm font-semibold tracking-[0.22em] text-white/85">KOLEKSİYON</div>
                <div className="mt-1 text-2xl font-semibold text-white">{c.title}</div>
                <div className="mt-1 text-sm text-white/80">{c.subtitle}</div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
                  {c.cta} <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </button>
          </Card>
        ))}
      </div>

      {/* Mini “Tüm ürünlere göz at” */}

<div className="mt-12">
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
      <h2 className="text-2xl font-semibold tracking-tight">Tüm ürünlere göz at</h2>
      <p className="mt-2 text-sm text-neutral-600">
        {filtered.length} ürün bulundu — detay için ürün sayfasına geç.
      </p>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ürün ara (kod, isim, renk...)"
          className="h-11 w-full rounded-full border bg-white pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/5 sm:w-[320px]"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className={cx("rounded-full border-black/15", filter === "all" && "bg-black/5")}
          onClick={() => setFilter("all")}
        >
          Tümü
        </Button>
        <Button
          variant="outline"
          className={cx("rounded-full border-black/15", filter === "aslan" && "bg-black/5")}
          onClick={() => setFilter("aslan")}
        >
          Aslan <ChevronRight className="ml-1 h-4 w-4 opacity-60" />
        </Button>
        <Button
          variant="outline"
          className={cx("rounded-full border-black/15", filter === "ottoman" && "bg-black/5")}
          onClick={() => setFilter("ottoman")}
        >
          Ottoman <ChevronRight className="ml-1 h-4 w-4 opacity-60" />
        </Button>
      </div>
    </div>
  </div>

  </div>

  <div className="grid gap-4 md:grid-cols-3">
    {featured.map((p) => (
      <button
        key={p.id}
        type="button"
        onClick={() => onGo({ name: "product", slug: p.collection, id: p.id })}
        className="group text-left"
      >
        <Card
          className="overflow-hidden rounded-3xl border bg-[var(--surface)] shadow-[0_16px_50px_rgba(0,0,0,0.06)] transition hover:shadow-[0_22px_70px_rgba(0,0,0,0.10)]"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className={cx(
              "h-[160px] w-full bg-gradient-to-br",
              p.collection === "aslan" ? "from-[#e8d7cf] to-[#f4eee8]" : "from-[#d7e6ef] to-[#f1f6fb]"
            )}
          />
          <div className="p-5">
            <div className="text-[11px] font-medium tracking-[0.22em] text-neutral-500">{p.family}</div>
            <div className="mt-2 line-clamp-2 text-sm font-semibold text-neutral-900">{p.title}</div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="text-sm font-semibold" style={{ color: BRAND.accent }}>
                {p.price}
              </div>
              <span className="text-xs font-medium text-neutral-700 opacity-0 transition group-hover:opacity-100">
                İncele <ChevronRight className="inline-block h-4 w-4 align-[-2px]" />
              </span>
            </div>
          </div>
        </Card>
      </button>
    ))}
  </div>

    </section>
  );
}


function CollectionPage({
  slug,
  products,
  onGo,
}: {
  slug: "aslan" | "ottoman";
  products: Product[];
  onGo: (r: Route) => void;
}) {
  const meta =
    slug === "aslan"
      ? {
          title: "Aslan Koleksiyonu",
          desc: "Katalog yapısını baz alarak: isim, kod, ölçü ve fiyat net.",
          cover: ASSETS.aslanCover,
        }
      : {
          title: "Ottoman",
          desc: "Katalog yapısını baz alarak: isim, kod, ölçü ve fiyat net.",
          cover: ASSETS.ottomanCover,
        };

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
            <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600">{meta.desc}</p>
            <div className="mt-3 h-px w-24" style={{ background: "var(--hairlineAccent)" }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-black/15"
              onClick={() => onGo({ name: "home" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Ana sayfa
            </Button>
            <Button variant="outline" className="rounded-full border-black/15" onClick={() => {}}>
              PDF kataloğu indir
            </Button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[32px] border bg-[var(--surface)] shadow-[0_18px_60px_rgba(0,0,0,0.08)]" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <img src={meta.cover} alt={meta.title} referrerPolicy="no-referrer" className="h-[260px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="text-sm font-semibold tracking-[0.22em] text-white/85">KOLEKSİYON</div>
              <div className="mt-1 text-2xl font-semibold text-white">{meta.title}</div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight">Ürünler</h2>
          <p className="mt-2 text-sm text-neutral-600">Katalog yapısını baz alarak: isim, kod, ölçü ve fiyat net.</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onGo={onGo} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductPage({
  product,
  onGo,
}: {
  product: Product;
  onGo: (r: Route) => void;
}) {
  const meta =
    product.collection === "aslan"
      ? { title: "Aslan Koleksiyonu", slug: "aslan" as const }
      : { title: "Ottoman", slug: "ottoman" as const };

  const gradient = product.collection === "aslan" ? "from-[#e8d7cf] to-[#f4eee8]" : "from-[#d7e6ef] to-[#f1f6fb]";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
        <button type="button" onClick={() => onGo({ name: "home" })} className="hover:text-neutral-900">
          Ana sayfa
        </button>
        <span className="text-neutral-400">/</span>
        <button type="button" onClick={() => onGo({ name: "collection", slug: meta.slug })} className="hover:text-neutral-900">
          {meta.title}
        </button>
        <span className="text-neutral-400">/</span>
        <span className="text-neutral-900">{product.title}</span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-12 md:items-start">
        <div className="md:col-span-7">
          <div
            className={cx("h-[420px] w-full overflow-hidden rounded-[32px] border bg-gradient-to-br shadow-[0_18px_60px_rgba(0,0,0,0.08)]", gradient)}
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="md:col-span-5">
          <div className="rounded-[32px] border bg-[var(--surface)] p-7 shadow-[0_16px_50px_rgba(0,0,0,0.06)]" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-[0.36em] text-neutral-800">{product.family}</div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">{product.title}</h1>
                <div className="mt-2 text-sm text-neutral-700">{product.subtitle}</div>
              </div>
              <span
                className="inline-flex items-center rounded-full border bg-[var(--paper)]/70 px-3 py-1 text-xs text-neutral-700"
                style={{ borderColor: "var(--hairline)" }}
              >
                {product.color}
              </span>
            </div>

            <div className="mt-6 grid gap-2 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-neutral-500">Kod</span>
                <span className="font-medium text-neutral-900">{product.code}</span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-neutral-500">Ölçü</span>
                <span className="font-medium text-neutral-900">{product.size}</span>
              </div>
              <div className="h-px w-full" style={{ background: "var(--border)" }} />
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-neutral-500">Fiyat</span>
                <span className="text-lg font-semibold" style={{ color: BRAND.accent }}>
                  {product.price}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Button className="w-full rounded-full text-white" style={{ background: BRAND.accent }}>
                Satın alma seçenekleri <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full rounded-full border-black/15" onClick={() => onGo({ name: "collection", slug: meta.slug })}>
                Koleksiyona dön
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="rounded-[32px] border bg-[var(--surface)] p-7" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold text-neutral-900">Açıklama</div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Ürün sayfası altyapısı hazır. Ürün görselleri ve metinler sonradan eklenecek şekilde yapılandırıldı.
            </p>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="rounded-[32px] border bg-[var(--surface)] p-7" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold text-neutral-900">Detaylar</div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-neutral-500">Koleksiyon</span>
                <span className="font-medium text-neutral-900">{meta.title}</span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-neutral-500">Renk</span>
                <span className="font-medium text-neutral-900">{product.color}</span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-neutral-500">Kategori</span>
                <span className="font-medium text-neutral-900">{product.family}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-[var(--paper)]" style={{ borderTopColor: "var(--border)" }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full" style={{ background: BRAND.accent }} />
              <div>
                <div className="text-sm font-semibold tracking-[0.18em]">{BRAND.name}</div>
                <div className="text-xs text-neutral-500">{BRAND.tagline}</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-neutral-600">Günlük ritüeller için koleksiyonluk sofra objeleri.</p>
          </div>

          <div className="grid gap-8 md:col-span-8 md:grid-cols-3">
            <div>
              <div className="text-sm font-semibold">Mağaza</div>
              <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  Fincanlar
                </a>
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  Tabaklar
                </a>
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  Sofra Objeleri
                </a>
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  Hediye Setleri
                </a>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Kurumsal</div>
              <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  Hakkında
                </a>
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  İletişim
                </a>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Destek</div>
              <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  Gönderim
                </a>
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  İade
                </a>
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  SSS
                </a>
                <a className="hover:text-neutral-900" href="#" onClick={(e) => e.preventDefault()}>
                  Gizlilik
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between"
          style={{ borderTopColor: "var(--border)" }}
        >
          <div>
            © {new Date().getFullYear()} {BRAND.name}. Tüm hakları saklıdır.
          </div>
          <div className="flex gap-4">
            <a className="hover:text-neutral-800" href="#" onClick={(e) => e.preventDefault()}>
              Instagram
            </a>
            <a className="hover:text-neutral-800" href="#" onClick={(e) => e.preventDefault()}>
              Şartlar
            </a>
            <a className="hover:text-neutral-800" href="#" onClick={(e) => e.preventDefault()}>
              Çerezler
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function JonquilHomepage() {
  const { route, go } = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const collectionsBtnRef = useRef<HTMLButtonElement | null>(null);

  const allProducts = useMemo<Product[]>(
    () => [
      {
        id: "aslan-cake-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Kırmızı/Altın  |  Red/Gold",
        color: "Kırmızı/Altın · Red/Gold",
        code: "20231500061",
        size: "Ø21cm",
        price: "1250 tl/adet",
      },
      {
        id: "aslan-cake-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Yeşil/Altın  |  Green/Gold",
        color: "Yeşil/Altın · Green/Gold",
        code: "20230300049",
        size: "Ø21cm",
        price: "1250 tl/adet",
      },
      {
        id: "aslan-serving-red",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Kırmızı/Altın  |  Red/Gold",
        color: "Kırmızı/Altın · Red/Gold",
        code: "20231400060",
        size: "Ø27cm",
        price: "1450 tl/adet",
      },
      {
        id: "aslan-serving-green",
        collection: "aslan",
        family: "ASLAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Yeşil/Altın  |  Green/Gold",
        color: "Yeşil/Altın · Green/Gold",
        code: "20230300048",
        size: "Ø27cm",
        price: "1450 tl/adet",
      },

      {
        id: "ottoman-cake-purple",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Mor/Pembe  |  Purple/Pink",
        color: "Mor/Pembe · Purple/Pink",
        code: "20230100037",
        size: "Ø20cm",
        price: "1250 tl/adet",
      },
      {
        id: "ottoman-cake-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Mavi/Kahve  |  Blue/Brown",
        color: "Mavi/Kahve · Blue/Brown",
        code: "20230100027",
        size: "Ø20cm",
        price: "1250 tl/adet",
      },
      {
        id: "ottoman-cake-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Yeşil/Turuncu  |  Green/Orange",
        color: "Yeşil/Turuncu · Green/Orange",
        code: "20230100017",
        size: "Ø20cm",
        price: "1250 tl/adet",
      },
      {
        id: "ottoman-cake-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Pasta Tabağı / Porcelain Cake Plate",
        subtitle: "Sarı/Kırmızı  |  Yellow/Red",
        color: "Sarı/Kırmızı · Yellow/Red",
        code: "20230100007",
        size: "Ø20cm",
        price: "1250 tl/adet",
      },
      {
        id: "ottoman-sharing-round",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Paylaşım Tabağı / Porcelain Sharing Plate",
        subtitle: "Çok Renkli  |  Multi Colored",
        color: "Çok Renkli · Multi Colored",
        code: "20230100072",
        size: "Ø28cm",
        price: "2750 tl/adet",
      },
      {
        id: "ottoman-sharing-oval",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Paylaşım Tabağı / Porcelain Sharing Plate",
        subtitle: "Çok Renkli  |  Multi Colored",
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
        subtitle: "Mor/Pembe  |  Purple/Pink",
        color: "Mor/Pembe · Purple/Pink",
        code: "20230100076",
        size: "Ø27cm",
        price: "1650 tl/adet",
      },
      {
        id: "ottoman-serving-blue",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Mavi/Kahve  |  Blue/Brown",
        color: "Mavi/Kahve · Blue/Brown",
        code: "20230100074",
        size: "Ø27cm",
        price: "1650 tl/adet",
      },
      {
        id: "ottoman-serving-green",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Yeşil/Turuncu  |  Green/Orange",
        color: "Yeşil/Turuncu · Green/Orange",
        code: "20230100073",
        size: "Ø27cm",
        price: "1650 tl/adet",
      },
      {
        id: "ottoman-serving-yellow",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Servis Tabağı / Porcelain Serving Plate",
        subtitle: "Sarı/Kırmızı  |  Yellow/Red",
        color: "Sarı/Kırmızı · Yellow/Red",
        code: "20230100075",
        size: "Ø27cm",
        price: "1650 tl/adet",
      },
      {
        id: "ottoman-coffee-set",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Kahve Fincanı Seti / Porcelain Coffee Cup Set",
        subtitle: "2’li Set",
        color: "Çeşitli Renkler",
        code: "20230100080",
        size: "2’li set",
        price: "3100 tl/set",
      },
      {
        id: "ottoman-cup-320",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Fincan / Porcelain Cup",
        subtitle: "320cc",
        color: "Çeşitli Renkler",
        code: "20230100040",
        size: "320cc",
        price: "1650 tl/adet",
      },
      {
        id: "ottoman-candle",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Mumluk / Glass Candle Holder",
        subtitle: "230cc",
        color: "Çeşitli Renkler",
        code: "20230100038",
        size: "230cc",
        price: "1650 tl/adet",
      },
      {
        id: "ottoman-ashtray",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Porselen Küllük / Porcelain Ashtray",
        subtitle: "Altın detaylı",
        color: "Çeşitli Renkler",
        code: "20230100039",
        size: "20x16cm",
        price: "3850 tl/adet",
      },
      {
        id: "ottoman-coaster",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Bardak Altlığı / Glass Coaster",
        subtitle: "",
        color: "Çeşitli Renkler",
        code: "20230100042",
        size: "",
        price: "850 tl/adet",
      },
      {
        id: "ottoman-cigar-ashtray",
        collection: "ottoman",
        family: "OTTOMAN",
        title: "Cam Puro Küllüğü / Glass Cigar Ashtray",
        subtitle: "",
        color: "Çeşitli Renkler",
        code: "20230100041",
        size: "",
        price: "2850 tl/adet",
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
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 20% -10%, rgba(15,63,68,0.10), transparent 60%), radial-gradient(900px 500px at 110% 20%, rgba(122,31,43,0.08), transparent 55%), radial-gradient(700px 420px at 40% 110%, rgba(199,163,91,0.10), transparent 55%)",
        }}
      />

      <header className="sticky top-0 z-40 border-b bg-[var(--paper)]/80 backdrop-blur" style={{ borderBottomColor: "var(--hairline)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <button
            type="button"
            className="flex items-center gap-5"
            onClick={() => go({ name: "home" })}
            aria-label="Ana sayfa"
          > 
            <div className="h-10 w-10 rounded-full shrink-0" style={{ background: BRAND.accent }} />
              
              <div className="flex flex-col items-start gap-0.5">
                <div className="text-[13px] font-bold tracking-[0.32em] text-neutral-900">
                      {BRAND.name}
                    </div>
                    <div className="text-[11px] font-light tracking-[0.08em] text-neutral-500">
                      {BRAND.tagline}
              </div>
            </div>
          </button>

          <nav className="relative ml-auto hidden items-center gap-1 md:flex">
            <div className="relative">
              <button
                ref={collectionsBtnRef}
                type="button"
                onClick={() => setCollectionsOpen((v) => !v)}
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-black/5",
                  collectionsOpen && "bg-black/5"
                )}
              >
                Koleksiyonlar <ChevronDown className={cx("h-4 w-4 transition", collectionsOpen && "rotate-180")} />
              </button>

              <CollectionDropdown
                open={collectionsOpen}
                anchorRef={collectionsBtnRef}
                onClose={() => setCollectionsOpen(false)}
                onGo={(r) => go(r)}
              />
            </div>

            <button
              type="button"
              onClick={() => go({ name: "about" })}
              className="rounded-full px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-black/5"
            >
              Hakkında
            </button>

            <button
              type="button"
              onClick={() => {
                // Şimdilik home’a gönderelim ya da contact route ekleriz
                // go({ name: "contact" });
                setHash({ name: "home" });
              }}
              className="rounded-full px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-black/5"
            >
              İletişim
            </button>
          </nav>


          <div className="flex items-center gap-2">
            <Button variant="ghost" className="rounded-full" aria-label="Ara">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="hidden rounded-full sm:inline-flex" aria-label="Hesabım">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="hidden rounded-full border-black/15 sm:inline-flex" aria-label="Sepet">
              <ShoppingBag className="mr-2 h-5 w-5" /> Sepet
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-black/15 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGo={(r) => {
          go(r);
          setCollectionsOpen(false);
        }}
      />

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

      {route.name === "product" && currentProduct ? <ProductPage product={currentProduct} onGo={go} /> : null}

      <Footer />
    </PageShell>
  );
}