// components/Navbar.tsx - TAM VE DÜZELTİLMİŞ VERSİYON
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Menu, Search, User, ShoppingBag, X,
  ChevronDown, ChevronRight, ArrowRight
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@/hooks/useClerkUser";
import { BRAND, ASSETS } from "@/constants/brand";
import { useCart } from "@/contexts/CartContext";
import { UserDropdown } from './UserDropdown';

const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });
const CartDrawer = dynamic(() => import('./CartDrawer').then((mod) => mod.CartDrawer), { ssr: false });

// Yardımcı Fonksiyon
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Product categories for mobile nav
const mobileCategories = [
  { id: "tabaklar", label: "Tabaklar" },
  { id: "fincanlar", label: "Fincanlar & Kupalar" },
  { id: "mumluklar", label: "Mumluklar" },
  { id: "kullukler", label: "Küllükler" },
  { id: "tepsiler", label: "Tepsiler & Kutular" },
  { id: "tekstil", label: "Tekstil" },
  { id: "aksesuarlar", label: "Aksesuarlar" },
];

// 1. MobileNav Bileşeni (Submenu'ler eklendi)
function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  return (
    <>
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div
            className="fixed right-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobil menü"
          >
            <div className="flex items-center justify-between border-b border-[#e8e6e3] p-6">
              <Image
                src={ASSETS.logo}
                alt={BRAND.name}
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#1a1a1a] hover:bg-[#e8e6e3]"
                aria-label="Menüyü kapat"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobil navigasyon">
              {/* Auth Section - Mobile */}
              <div className="mb-6 space-y-2">
                <SignedOut>
                  <SignInButton
                    mode="modal"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "rounded-2xl shadow-2xl",
                        socialButtonsBlockButton: "border border-[#e8e6e3] hover:bg-[#faf8f5]",
                        formButtonPrimary: "bg-[#0f3f44] hover:bg-[#0a2a2e]",
                        footerActionLink: "text-[#0f3f44]",
                      }
                    }}
                  >
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3f44] px-4 py-3 text-sm font-medium text-white hover:bg-[#0a2a2e]">
                      <User className="h-4 w-4" />
                      Giriş Yap
                    </button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/hesabim"
                    onClick={onClose}
                    className="flex w-full items-center gap-3 rounded-xl border border-[#e8e6e3] bg-[#faf8f5] p-3 text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0f3f44] bg-[#0f3f44] text-white font-semibold">
                      H
                    </div>
                    <span className="text-sm font-medium text-[#1a1a1a]">Hesabım</span>
                  </Link>
                </SignedIn>
              </div>

              <div className="space-y-1">
                {/* Products with submenu */}
                <div>
                  <button
                    onClick={() => setProductsOpen(!productsOpen)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]"
                    aria-expanded={productsOpen}
                  >
                    Ürünler
                    <ChevronDown className={`h-4 w-4 text-[#999] transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {productsOpen && (
                      <div className="overflow-hidden">
                        <div className="ml-4 space-y-1 border-l-2 border-[#e8e6e3] py-2 pl-4">
                          <Link
                            href="/urunler"
                            onClick={onClose}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-[#0f3f44] hover:bg-[#faf8f5]"
                          >
                            Tüm Ürünler
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                          {mobileCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/kategori/${cat.id}`}
                              onClick={onClose}
                              className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-[#666] hover:bg-[#faf8f5] hover:text-[#2a2a2a]"
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Collections with submenu */}
                <div>
                  <button
                    onClick={() => setCollectionsOpen(!collectionsOpen)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]"
                    aria-expanded={collectionsOpen}
                  >
                    Koleksiyonlar
                    <ChevronDown className={`h-4 w-4 text-[#999] transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {collectionsOpen && (
                      <div className="overflow-hidden">
                        <div className="ml-4 space-y-1 border-l-2 border-[#e8e6e3] py-2 pl-4">
                          <Link
                            href="/koleksiyon/aslan"
                            onClick={onClose}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#666] hover:bg-[#faf8f5] hover:text-[#2a2a2a]"
                          >
                            <div className="relative h-8 w-8 overflow-hidden rounded-md">
                              <Image src={ASSETS.aslanCover} alt="Aslan" fill sizes="32px" className="object-cover" />
                            </div>
                            Aslan Koleksiyonu
                          </Link>
                          <Link
                            href="/koleksiyon/ottoman"
                            onClick={onClose}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#666] hover:bg-[#faf8f5] hover:text-[#2a2a2a]"
                          >
                            <div className="relative h-8 w-8 overflow-hidden rounded-md">
                              <Image src={ASSETS.ottomanCover} alt="Ottoman" fill sizes="32px" className="object-cover" />
                            </div>
                            Ottoman Koleksiyonu
                          </Link>
                        </div>
                      </div>
                    )}
                </div>

                <Link href="/hakkimizda" onClick={onClose} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                  Hakkımızda <ChevronRight className="h-4 w-4 text-[#999]" />
                </Link>
                <Link href="/blog" onClick={onClose} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                  Blog <ChevronRight className="h-4 w-4 text-[#999]" />
                </Link>
                <Link href="/iletisim" onClick={onClose} className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">
                  İletişim <ChevronRight className="h-4 w-4 text-[#999]" />
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

// 2. CollectionDropdown Bileşeni (Renkler düzeltildi)
function CollectionDropdown({
  open,
  anchorRef,
  onClose,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
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
    <>
      {open && (
        <div ref={dropdownRef} className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div className="p-3">
            <Link href="/koleksiyon/aslan" onClick={onClose} className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-[#faf8f5]">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                <Image src={ASSETS.aslanCover} alt="Aslan" fill sizes="64px" className="object-cover" />
              </div>
              <div>
                  <div className="text-sm font-semibold text-[#1a1a1a]">Aslan Koleksiyonu</div>
                  <div className="text-xs text-[#999]">Klasik tasarımlar</div>
              </div>
            </Link>
            <Link href="/koleksiyon/ottoman" onClick={onClose} className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-[#faf8f5]">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                <Image src={ASSETS.ottomanCover} alt="Ottoman" fill sizes="64px" className="object-cover" />
              </div>
              <div>
                  <div className="text-sm font-semibold text-[#1a1a1a]">Ottoman Koleksiyonu</div>
                  <div className="text-xs text-[#999]">Renkli desenler</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// 3. ProductsDropdown Bileşeni (Tam liste ve renkler)
function ProductsDropdown({
  open,
  anchorRef,
  onClose,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
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
    <>
      {open && (
        <div ref={dropdownRef} className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div className="p-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/kategori/${cat.id}`} onClick={onClose} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-[#2a2a2a] transition-colors hover:bg-[#faf8f5]">
                {cat.label}
                <ChevronRight className="h-4 w-4 text-[#999]" />
              </Link>
            ))}
            <div className="mt-3 border-t border-[#e8e6e3] pt-3">
              <Link href="/urunler" onClick={onClose} className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#0f3f44] to-[#0a2a2e] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Tüm Ürünler <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- ANA NAVBAR BİLEŞENİ ---
export default function Navbar({ onCartClick }: { onCartClick?: () => void } = {}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const collectionsBtnRef = useRef<HTMLButtonElement>(null);
  const productsBtnRef = useRef<HTMLButtonElement>(null);
  const { totalItems } = useCart();

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      setCartOpen(true);
    }
  };

  // Handle product click from search
  const handleSearchProductClick = (product: any) => {
    router.push(`/urun/${product.id}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e8e6e3]/50 bg-white/80 backdrop-blur-xl" role="banner">
        <div className="bg-[#0f3f44] px-6 py-2 text-center text-[11px] font-medium tracking-wide text-white">
          500 TL üzeri ücretsiz kargo
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <Link href="/" className="flex items-center" aria-label="Ana sayfa">
            <Image
              src={ASSETS.logo}
              alt={BRAND.name}
              width={144}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>

          <nav className="relative ml-auto hidden items-center gap-1 md:flex" aria-label="Ana menü">
             <div className="relative">
               <button
                 ref={collectionsBtnRef}
                 onClick={() => setCollectionsOpen(!collectionsOpen)}
                 className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]"
                 aria-expanded={collectionsOpen}
                 aria-haspopup="true"
               >
                 Koleksiyonlar
               </button>
               <CollectionDropdown open={collectionsOpen} anchorRef={collectionsBtnRef} onClose={() => setCollectionsOpen(false)} />
             </div>
             <div className="relative">
               <button
                 ref={productsBtnRef}
                 onClick={() => setProductsOpen(!productsOpen)}
                 className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]"
                 aria-expanded={productsOpen}
                 aria-haspopup="true"
               >
                 Ürünler
               </button>
               <ProductsDropdown open={productsOpen} anchorRef={productsBtnRef} onClose={() => setProductsOpen(false)} />
             </div>
             <Link href="/hakkimizda" className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">Hakkımızda</Link>
             <Link href="/blog" className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">Blog</Link>
             <Link href="/iletisim" className="px-4 py-2.5 text-sm font-medium text-[#2a2a2a] hover:bg-[#faf8f5]">İletişim</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#2a2a2a] hover:bg-[#faf8f5]"
              aria-label="Ürün ara"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Sepet */}
            <button
              onClick={handleCartClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#2a2a2a] hover:bg-[#faf8f5]"
              aria-label={`Sepet${totalItems > 0 ? `, ${totalItems} ürün` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f3f44] text-xs font-medium text-white" aria-hidden="true">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            <SignedOut>
              <SignInButton
                mode="modal"
                appearance={{
                  elements: {
                    rootBox: "min-w-[400px]",
                    card: "rounded-2xl shadow-2xl",
                    socialButtonsBlockButton: "border border-[#e8e6e3] hover:bg-[#faf8f5]",
                    formButtonPrimary: "bg-[#0f3f44] hover:bg-[#0a2a2e]",
                    footerActionLink: "text-[#0f3f44]",
                  }
                }}
              >
                <button className="flex h-10 items-center gap-2 rounded-full bg-[#0f3f44] px-4 text-sm font-medium text-white hover:bg-[#0a2a2e]" aria-label="Giriş yap">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden lg:inline">Giriş Yap</span>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserDropdown />
            </SignedIn>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e6e3] text-[#2a2a2a] md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Menüyü aç"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onProductClick={handleSearchProductClick}
      />
      {!onCartClick && (
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            router.push('/odeme');
          }}
        />
      )}
    </>
  );
}
