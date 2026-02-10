import Link from "next/link";
import Image from "next/image";

const posts = [
  {
    slug: "porselen-bakimi",
    title: "Porselen Bakımı: Uzun Ömürlü Kullanım",
    excerpt: "Porselen ürünlerinizi ilk günkü gibi korumak için pratik bakım ipuçları.",
    image: "/images/products/GENEL FOTOLAR/Header-2.jpg",
  },
  {
    slug: "sofra-stili",
    title: "Sofra Stili: Zarif Sunumlar",
    excerpt: "Şık sofralar için renk uyumu ve düzenleme önerileri.",
    image: "/images/products/GENEL FOTOLAR/Header-3.jpg",
  },
  {
    slug: "hediye-secimi",
    title: "Hediye Seçimi: Özel Anlar",
    excerpt: "Sevdiklerinize unutulmaz bir hediye seçmek için kısa bir rehber.",
    image: "/images/products/GENEL FOTOLAR/Header-1.jpg",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-[#1a1a1a]">Blog</h1>
        <p className="mt-3 text-sm text-[#666]">
          Jonquil dünyasından ipuçları, bakım önerileri ve stil notları.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white">
            <div className="relative aspect-[4/3]">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="p-5">
              <h2 className="mb-2 text-lg font-semibold text-[#1a1a1a]">
                {post.title}
              </h2>
              <p className="mb-4 text-sm text-[#666]">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-[#0f3f44] hover:underline">
                Devamını oku →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
