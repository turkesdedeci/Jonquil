export const BRAND = {
  name: "JONQUIL",
  tagline: "Designer Tableware",
  description: "Premium el yapımı porselen ve tasarım objeleri",
};

const LOGO_VERSION = "20260215-1";

export const ASSETS = {
  // Logo
  logo: `/images/products/GENEL FOTOLAR/LOGO/Studio.png?v=${LOGO_VERSION}`,
  
  // Hero images
  hero: "/images/products/GENEL FOTOLAR/Header-1.jpg",

  // Collection cover images
  aslanCover: "/images/products/GENEL FOTOLAR/Aslan Temsil.jpg",
  ottomanCover: "/images/footerslayt/image00005.jpeg",
  
  // About page images
  aboutHero: "/images/products/GENEL FOTOLAR/Header-1.jpg",
  aboutStory: "/images/products/GENEL FOTOLAR/Header-1.jpg",
  
  // Lifestyle & Background images
  tablescape: "/images/products/GENEL FOTOLAR/Header-1.jpg",
  craftsmanship: "/images/products/GENEL FOTOLAR/Header-1.jpg",
};

// Collection metadata
export const COLLECTIONS = {
  aslan: {
    title: "Aslan Koleksiyonu",
    subtitle: "CLASSIC DESIGN",
    description: "Zamansız çizgiler ve klasik tasarımlarla sofranıza zarafet katın. Aslan koleksiyonu, modern minimalizmi geleneksel el işçiliğiyle buluşturuyor.",
    badge: "CLASSIC DESIGN",
    cover: ASSETS.aslanCover,
  },
  ottoman: {
    title: "Ottoman Koleksiyonu",
    subtitle: "COLORFUL PATTERNS",
    description: "Zengin renkler ve desenlerle Osmanlı sanatını yeniden yorumlayan koleksiyon. Her parça, kültürel miras + modern pop art birleşimi.",
    badge: "COLORFUL PATTERNS",
    cover: ASSETS.ottomanCover,
  },
};
