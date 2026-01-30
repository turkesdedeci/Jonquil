// components/Navbar.tsx - TAM VE DÜZELTİLMİŞ VERSİYON
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, Search, User, ShoppingBag, X, 
  ChevronDown, ChevronRight, ArrowRight 
} from "lucide-react";
import { BRAND, ASSETS } from "@/constants/brand";

// Yardımcı Fonksiyon
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// 1. MobileNav Bileşeni (Renkler düzeltildi)
function MobileNav({
  open,
  onClose,
  onGo,
}: {
  open: boolean;
  onClose: () => void;
  onGo: (r: any) => void;
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
              <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-[#1a1a1a] hover:bg-[#e8e6e3]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-6">
              <div className="space-y-1">
                <button onClick={() => { onGo({ name: "collections" }); onClose(); }} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                  Koleksiyonlar <ChevronRight className="h-4 w-4 text-[#999]" />
                </button>
                <button onClick={() => { onGo({ name: "about" }); onClose(); }} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                  Hakkımızda <ChevronRight className="h-4 w-4 text-[#999]" />
                </button>
                <button onClick={() => { onGo({ name: "contact" }); onClose(); }} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                  İletişim <ChevronRight className="h-4 w-4 text-[#999]" />
                </button>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 2. CollectionDropdown Bileşeni (Renkler düzeltildi)
function CollectionDropdown({
  open,
  anchorRef,
  onClose,
  onGo,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onGo: (r: any) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && anchorRef?.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={dropdownRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div className="p-3">
            <button onClick={() => { onGo({ name: "collection", slug: "aslan" }); onClose(); }} className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-[#faf8f5]">
              <img src={ASSETS.aslanCover} className="h-16 w-16 rounded-lg object-cover" />
              <div>
                  {/* DÜZELTME: text-[#1a1a1a] eklendi */}
                  <div className="text-sm font-semibold text-[#1a1a1a]">Aslan Koleksiyonu</div>
                  <div className="text-xs text-[#999]">Klasik tasarımlar</div>
              </div>
            </button>
            <button onClick={() => { onGo({ name: "collection", slug: "ottoman" }); onClose(); }} className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-[#faf8f5]">
              <img src={ASSETS.ottomanCover} className="h-16 w-16 rounded-lg object-cover" />
              <div>
                  {/* DÜZELTME: text-[#1a1a1a] eklendi */}
                  <div className="text-sm font-semibold text-[#1a1a1a]">Ottoman Koleksiyonu</div>
                  <div className="text-xs text-[#999]">Renkli desenler</div>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 3. ProductsDropdown Bileşeni (Tam liste ve renkler)
function ProductsDropdown({
  open,
  anchorRef,
  onClose,
  onGo,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onGo: (r: any) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && anchorRef?.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  const categories = [
    { id: "tabaklar", label: "Tabaklar" },
    { id: "fincanlar", label: "Fincanlar & Kupalar" },
    { id: "mumluklar", label: "Mumluklar" },
    { id: "kullukler", label: "Küllükler" },
    { id: "tepsiler", label: "Tepsiler & Kutular" },
    { id: "tekstil", label: "Tekstil" },
    { id: "aksesuarlar", label: "Aksesuarlar" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={dropdownRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div className="p-3">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => { onGo({ name: "category", category: cat.id }); onClose(); }} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]">
                {cat.label}
                <ChevronRight className="h-4 w-4 text-[#999]" />
              </button>
            ))}
            <div className="mt-3 border-t border-[#e8e6e3] pt-3">
              <button onClick={() => { onGo({ name: "products" }); onClose(); }} className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Tüm Ürünler <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- ANA NAVBAR BİLEŞENİ ---
export default function Navbar({ go }: { go: (r: any) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const collectionsBtnRef = useRef<HTMLButtonElement>(null);
  const productsBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e8e6e3]/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <button type="button" className="flex items-center gap-4" onClick={() => go({ name: "home" })}>
            <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#0f3f44] to-[#0a2a2e]" />
            <div className="flex flex-col items-start gap-0.5">
              <div className="text-sm font-bold tracking-[0.32em] text-[#1a1a1a]">{BRAND.name}</div>
              <div className="text-[10px] font-light text-[#999]">{BRAND.tagline}</div>
            </div>
          </button>

          <nav className="relative ml-auto hidden items-center gap-1 md:flex">
             {/* DÜZELTME: Ana linklere text-[#2a2a2a] eklendi */}
             <div className="relative">
               <button ref={collectionsBtnRef} onClick={() => setCollectionsOpen(!collectionsOpen)} className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                 Koleksiyonlar
               </button>
               <CollectionDropdown open={collectionsOpen} anchorRef={collectionsBtnRef} onClose={() => setCollectionsOpen(false)} onGo={go} />
             </div>
             <div className="relative">
               <button ref={productsBtnRef} onClick={() => setProductsOpen(!productsOpen)} className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                 Ürünler
               </button>
               <ProductsDropdown open={productsOpen} anchorRef={productsBtnRef} onClose={() => setProductsOpen(false)} onGo={go} />
             </div>
             <button onClick={() => go({ name: "about" })} className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">Hakkımızda</button>
             <button onClick={() => go({ name: "contact" })} className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">İletişim</button>
          </nav>

          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#2a2a2a] hover:bg-[#faf8f5]"><Search className="h-5 w-5" /></button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e6e3] text-[#2a2a2a] md:hidden" onClick={() => setMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} onGo={go} />
    </>
  );
}