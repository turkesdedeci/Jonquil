import Link from 'next/link';
import Image from 'next/image';
import { getAllProductsServer } from '@/lib/products-server';

export async function RelatedProducts({ productIds }: { productIds: string[] }) {
  if (!productIds.length) return null;

  const allProducts = await getAllProductsServer();
  const products = productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);

  if (!products.length) return null;

  return (
    <div className="rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-6">
      <h3 className="mb-4 text-lg font-semibold text-[#1a1a1a]">İlgili Ürünler</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {products.map((product) => {
          if (!product) return null;
          const mainImage = product.images?.[0] || '/images/placeholder.jpg';

          return (
            <Link
              key={product.id}
              href={`/urun/${product.id}`}
              className="group flex items-center gap-3 rounded-xl bg-white p-3 transition-shadow hover:shadow-md"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-[#d4af7a]">
                  {product.family}
                </p>
                <p className="line-clamp-2 text-sm font-medium leading-snug text-[#1a1a1a] group-hover:text-[#0f3f44]">
                  {product.title}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f3f44]">{product.price}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
