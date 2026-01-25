"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
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
  cover:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2400&q=85",
  atelier:
    "https://images.unsplash.com/photo-1520975682031-ae7cfd3f7a4a?auto=format&fit=crop&w=2400&q=85",
  detail:
    "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=2400&q=85",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

function StatCard({
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

export default function AboutPage() {
  const values = useMemo(
    () => [
      {
        title: "Az ama tam",
        desc: "Her parça seçki mantığıyla; gereksiz kalabalık yok, net bir duruş var.",
      },
      {
        title: "Zanaat & sabır",
        desc: "Renk, form ve yüzey; aceleye gelmeyen bir üretim ritmi.",
      },
      {
        title: "Gündelik lüks",
        desc: "Gösteriş değil; dokununca anlaşılan kalite ve dinginlik.",
      },
    ],
    []
  );

  return (
    <PageShell>
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 20% -10%, rgba(15,63,68,0.10), transparent 60%), radial-gradient(900px 500px at 110% 20%, rgba(122,31,43,0.08), transparent 55%), radial-gradient(700px 420px at 40% 110%, rgba(199,163,91,0.10), transparent 55%)",
        }}
      />

      {/* TOP BAR */}
      <header
        className="sticky top-0 z-40 border-b bg-[var(--paper)]/80 backdrop-blur"
        style={{ borderBottomColor: "var(--hairline)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Ana sayfa">
            <div className="h-10 w-10 rounded-full" style={{ background: BRAND.accent }} />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.18em]">
                {BRAND.name}
              </div>
              <div className="text-xs text-neutral-500">{BRAND.tagline}</div>
            </div>
          </a>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-black/15"
              onClick={() => (window.location.href = "/")}
            >
              Ana sayfa
            </Button>
            <Button
              className="rounded-full text-white"
              style={{ background: BRAND.accent }}
              onClick={() => (window.location.hash = "#/koleksiyon/aslan")}
            >
              Koleksiyonlara git <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div
          className="grid gap-6 overflow-hidden rounded-[32px] border bg-[var(--surface)] shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:grid-cols-12"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="relative md:col-span-5">
            <div className="h-full p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <div className="flex flex-wrap gap-2">
                  <Pill>
                    <BadgeCheck className="h-4 w-4" /> Hakkımızda
                  </Pill>
                </div>

                <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Sessiz bir lüks,
                  <br /> net bir çizgi.
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6" style={{ color: BRAND.inkSoft }}>
                  Jonquil; porselen ve tasarım objelerinde “az ama tam” yaklaşımını benimser.
                  Renk hikâyeleri, yüzey detayları ve zamansız formlar, gündelik sofraları
                  daha rafine hale getirmek için bir araya gelir.
                </p>

                <div className="mt-8 grid gap-3">
                  <div className="h-px w-16" style={{ background: "var(--hairlineAccent)" }} />
                  <div className="text-xs tracking-[0.28em] text-neutral-500">
                    DESIGN · PORCELAIN · OBJECTS
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="relative h-[305px] md:col-span-7 md:h-[565px]">
            <img
              src={ASSETS.cover}
              alt="Jonquil cover"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-black/5 to-transparent" />
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Kalite standardı"
            desc="Malzeme, yüzey ve paketleme — tutarlı bir kalite çizgisi."
          />
          <StatCard
            icon={<Truck className="h-5 w-5" />}
            title="Özenli gönderim"
            desc="Koruyucu paketleme, temiz teslimat deneyimi."
          />
          <StatCard
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Seçki mantığı"
            desc="Az ürün, yüksek karakter — koleksiyon gibi."
          />
        </div>
      </section>

      {/* STORY + IMAGE */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12 md:items-stretch">
          <div className="md:col-span-6">
            <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Hikâye: sofra bir sahnedir.
            </h2>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Jonquil’in çıkış noktası basit: gündelik hayatın küçük anlarını daha iyi hissettiren
              parçalar üretmek. Bir fincanın ağırlığı, bir tabağın kenar çizgisi, bir desenin
              ışıkla değişen tonu…
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Koleksiyonlarımız; sahne kuran tabaklar, ritüel yaratan fincanlar ve mekâna karakter
              katan objelerden oluşur. Her parça tek başına güçlü; yan yana gelince bütünlüklü.
            </p>

            <div className="mt-8 grid gap-3">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="rounded-3xl border bg-[var(--surface)] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="text-sm font-semibold text-neutral-900">{v.title}</div>
                  <div className="mt-2 text-sm leading-6 text-neutral-600">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="grid gap-4">
              <img
                src={ASSETS.atelier}
                alt="Atölye"
                referrerPolicy="no-referrer"
                className="h-[320px] w-full rounded-[32px] object-cover shadow-[0_18px_60px_rgba(0,0,0,0.10)]"
              />
              <img
                src={ASSETS.detail}
                alt="Detay"
                referrerPolicy="no-referrer"
                className="h-[320px] w-full rounded-[32px] object-cover shadow-[0_18px_60px_rgba(0,0,0,0.10)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-[var(--paper)]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <Card
            className="rounded-[32px] border bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:p-12"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <div className="mb-2 h-1 w-6 rounded-full" style={{ background: BRAND.accent }} />
                <h3 className="text-2xl font-semibold tracking-tight">İletişim</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                  Toplu sipariş, hediye seti veya satış noktaları için yazabilirsin. İstersen hızlıca
                  koleksiyonlara dönüp ürünleri inceleyelim.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-4" style={{ borderColor: "var(--border)" }}>
                    <MapPin className="mt-0.5 h-5 w-5 text-neutral-700" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Konum</div>
                      <div className="mt-1 text-sm text-neutral-600">İstanbul (örnek)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-4" style={{ borderColor: "var(--border)" }}>
                    <Phone className="mt-0.5 h-5 w-5 text-neutral-700" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Telefon</div>
                      <div className="mt-1 text-sm text-neutral-600">+90 (5xx) xxx xx xx (örnek)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="rounded-[28px] border p-6" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm font-semibold text-neutral-900">Hızlı aksiyon</div>
                  <div className="mt-4 grid gap-3">
                    <Button
                      className="w-full rounded-full text-white"
                      style={{ background: BRAND.accent }}
                      onClick={() => (window.location.hash = "#/koleksiyon/aslan")}
                    >
                      Koleksiyonlara dön <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-black/15"
                      onClick={() => (window.location.href = "/")}
                    >
                      Ana sayfa
                    </Button>
                  </div>
                  <div className="mt-4 text-xs text-neutral-500">
                    Not: Bu metinler ve iletişim alanları demo amaçlıdır; gerçek bilgilerle güncelleriz.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between" style={{ borderTopColor: "var(--border)" }}>
            <div>© {new Date().getFullYear()} {BRAND.name}. Tüm hakları saklıdır.</div>
            <div className="flex gap-4">
              <a className="hover:text-neutral-800" href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}>
                Ana sayfa
              </a>
              <a className="hover:text-neutral-800" href="#" onClick={(e) => e.preventDefault()}>
                Gizlilik
              </a>
              <a className="hover:text-neutral-800" href="#" onClick={(e) => e.preventDefault()}>
                Şartlar
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
