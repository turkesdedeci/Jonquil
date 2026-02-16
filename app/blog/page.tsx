import type { Metadata } from 'next';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { getAllPosts, getAllCategories } from '@/lib/blog/posts';
import { BlogCard } from '@/components/blog/BlogCard';
import { generateBlogListSchema } from '@/lib/blog/schema';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog | Jonquil Studio',
  description:
    'Porselen bakımı, sofra stili ve hediye seçimi konularında Jonquil Studio blog yazıları.',
  alternates: {
    canonical: absoluteUrl('/blog'),
  },
  openGraph: {
    title: 'Blog | Jonquil Studio',
    description:
      'Porselen bakımı, sofra stili ve hediye seçimi konularında Jonquil Studio blog yazıları.',
    type: 'website',
    url: absoluteUrl('/blog'),
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl('/images/og-default.jpg'),
        alt: 'Jonquil Studio Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Jonquil Studio',
    description:
      'Porselen bakımı, sofra stili ve hediye seçimi konularında Jonquil Studio blog yazıları.',
    images: [absoluteUrl('/images/og-default.jpg')],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const jsonLd = generateBlogListSchema(posts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-[#1a1a1a]">Blog</h1>
          <p className="mt-3 text-sm text-[#666]">
            Jonquil dünyasından ipuçları, bakım önerileri ve stil notları.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className="rounded-full bg-[#0f3f44] px-4 py-1.5 text-sm font-medium text-white"
            >
              Tümü
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/kategori/${cat.slug}`}
                className="rounded-full border border-[#e8e6e3] px-4 py-1.5 text-sm font-medium text-[#666] transition-colors hover:border-[#0f3f44] hover:text-[#0f3f44]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="py-20 text-center text-[#999]">
            Henüz blog yazısı bulunmuyor.
          </p>
        )}
      </div>
    </>
  );
}
