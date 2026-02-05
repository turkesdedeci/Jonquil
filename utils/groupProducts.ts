// utils/groupProducts.ts
// Group products by their base properties to create variant system

export interface ProductVariant {
  id: string;
  color: string;
  subtitle: string;
  code: string;
  images: string[];
  tags: string[];
}

export interface GroupedProduct {
  id: string;
  collection: string;
  family: string;
  title: string;
  subtitle: string;
  color: string;
  code: string;
  size: string;
  price: string;
  material: string;
  productType: string;
  usage: string;
  capacity: string | null;
  setSingle: string;
  tags: string[];
  images: string[];
  variants: ProductVariant[];
  isBestSeller?: boolean; // Optional: best seller flag
}

/**
 * Groups products with the same base properties but different colors
 * Example: Red Lion Plate + Green Lion Plate => 1 product with 2 color variants
 */
export function groupProductsByVariants(products: any[]): GroupedProduct[] {
  const grouped = new Map<string, GroupedProduct>();

  products.forEach((product) => {
    // Create unique key based on product properties (excluding color-specific data)
    const baseKey = `${product.collection}-${product.title}-${product.size}-${product.price}-${product.productType}`;

    if (!grouped.has(baseKey)) {
      // First variant - create the group
      grouped.set(baseKey, {
        ...product,
        variants: [
          {
            id: product.id,
            color: product.color,
            subtitle: product.subtitle,
            code: product.code,
            images: product.images,
            tags: product.tags,
          },
        ],
      });
    } else {
      // Add variant to existing group
      const existingGroup = grouped.get(baseKey)!;
      existingGroup.variants.push({
        id: product.id,
        color: product.color,
        subtitle: product.subtitle,
        code: product.code,
        images: product.images,
        tags: product.tags,
      });
    }
  });

  return Array.from(grouped.values());
}

/**
 * Get color swatch gradient style
 */
export function getColorSwatchStyle(colorName: string): React.CSSProperties {
  const colorMap: Record<string, string> = {
    "Kırmızı/Altın": "linear-gradient(135deg, #b91c1c 0%, #d4af37 100%)",
    "Yeşil/Altın": "linear-gradient(135deg, #15803d 0%, #d4af37 100%)",
    "Mor/Pembe": "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    "Mavi/Kahve": "linear-gradient(135deg, #1e40af 0%, #78350f 100%)",
    "Yeşil/Turuncu": "linear-gradient(135deg, #15803d 0%, #ea580c 100%)",
    "Sarı/Kırmızı": "linear-gradient(135deg, #eab308 0%, #dc2626 100%)",
    "Pembe/İnci": "linear-gradient(135deg, #ec4899 0%, #f5f5f4 100%)",
    "İnci/Renkli": "linear-gradient(135deg, #f5f5f4 0%, #3b82f6 50%, #ec4899 100%)",
    "Çok Renkli": "linear-gradient(135deg, #3b82f6 0%, #ec4899 33%, #eab308 66%, #15803d 100%)",
    "Mor/Pembe/Altın": "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #d4af37 100%)",
    "Mavi/Kahve/Altın": "linear-gradient(135deg, #1e40af 0%, #78350f 50%, #d4af37 100%)",
    "Yeşil/Turuncu/Altın": "linear-gradient(135deg, #15803d 0%, #ea580c 50%, #d4af37 100%)",
    "Sarı/Kırmızı/Altın": "linear-gradient(135deg, #eab308 0%, #dc2626 50%, #d4af37 100%)",
  };

  return {
    background: colorMap[colorName] || "#e5e7eb",
  };
}

/**
 * Smart variant selection for product cards with block rotation
 * Groups products into blocks of 4, each block shows different color
 * Makes the collection page colorful in an organized, rhythmic way
 */
export function getDisplayVariantIndex(product: GroupedProduct, productIndex: number): number {
  if (!product.variants || product.variants.length <= 1) {
    return 0;
  }
  
  // Custom color assignments by product title
  const customColorAssignments: Record<string, string> = {
    // Altıgen Tepsi → Force Yeşil/Turuncu
    'Akrilik Altıgen Tepsi': 'Yeşil/Turuncu',
    'Altıgen Tepsi': 'Yeşil/Turuncu',
    
    // Row 2: Make Sarı/Kırmızı (with /Altın suffix for gold-trimmed products)
    'Kupa': 'Sarı/Kırmızı/Altın',
    'Mumluk': 'Sarı/Kırmızı/Altın',
    'Küllük': 'Sarı/Kırmızı/Altın',  // Has gold trim
    'Ashtray': 'Sarı/Kırmızı/Altın', // Has gold trim
    'Bardak Altlığı': 'Sarı/Kırmızı/Altın',
    'Coasters': 'Sarı/Kırmızı/Altın',
  };
  
  // Check if this product has a custom color
  for (const [titleKeyword, targetColor] of Object.entries(customColorAssignments)) {
    // Case-insensitive partial match
    if (product.title.toLowerCase().includes(titleKeyword.toLowerCase())) {
      // Find the variant with this color
      const variantIndex = product.variants.findIndex((v: any) => v.color === targetColor);
      if (variantIndex >= 0) {
        return variantIndex;
      }
      // If exact color not found, log for debugging
      console.log(`⚠️ Color "${targetColor}" not found for "${product.title}". Available:`, product.variants.map((v: any) => v.color));
    }
  }
  
  // Default: Group products into blocks of 4
  const blockSize = 4;
  const blockIndex = Math.floor(productIndex / blockSize);
  return blockIndex % product.variants.length;
}