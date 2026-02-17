import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog/posts';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '@/lib/blog/schema';
import { BlogContent } from '@/components/blog/BlogContent';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { RelatedProducts } from '@/components/blog/RelatedProducts';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { BlogCard } from '@/components/blog/BlogCard';
import NewsletterCTA from '@/components/NewsletterCTA';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    alternates: {
      canonical: url,
      languages: { 'tr-TR': url, 'x-default': url },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      section: post.category,
      tags: post.tags,
      locale: 'tr_TR',
      images: [
        {
          url: absoluteUrl(post.coverImage),
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [absoluteUrl(post.coverImage)],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, 3);
  const postUrl = absoluteUrl(`/blog/${post.slug}`);

  const postingSchema = generateBlogPostingSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: absoluteUrl('/') },
    { name: 'Blog', url: absoluteUrl('/blog') },
    { name: post.title, url: postUrl },
  ]);

  const publishDate = new Date(post.publishedAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#999]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#0f3f44]">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="hover:text-[#0f3f44]">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#666]">{post.title}</span>
        </nav>

        {/* Back */}
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#0f3f44] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Tüm Yazılar
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/blog/kategori/${post.category.toLowerCase().replace(/\s+/g, '-').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's').replace(/ç/g, 'c')}`}
              className="rounded-full bg-[#0f3f44] px-3 py-1 text-xs font-medium text-white"
            >
              {post.category}
            </Link>
            <div className="flex items-center gap-4 text-sm text-[#999]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.publishedAt}>{publishDate}</time>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime}
              </span>
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-[#1a1a1a] md:text-4xl">
            {post.title}
          </h1>
          <p className="text-lg text-[#666]">{post.description}</p>
        </header>

        {/* Cover image */}
        <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-2xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
            priority
          />
        </div>

        {/* Content + Sidebar */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <div className="min-w-0">
            <div className="rounded-2xl border border-[#ece7de] bg-white px-6 py-7 md:px-8 md:py-9">
              <BlogContent source={post.content} />
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[#e8e6e3] pt-6">
                <span className="text-sm font-medium text-[#999]">Etiketler:</span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/etiket/${tag.toLowerCase().replace(/\s+/g, '-').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's').replace(/ç/g, 'c')}`}
                    className="rounded-full border border-[#e8e6e3] px-3 py-1 text-xs text-[#666] transition-colors hover:border-[#0f3f44] hover:text-[#0f3f44]"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-6 border-t border-[#e8e6e3] pt-6">
              <ShareButtons url={postUrl} title={post.title} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <TableOfContents content={post.content} />
            <RelatedProducts productIds={post.relatedProducts} />
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t border-[#e8e6e3] pt-10">
            <h2 className="mb-6 text-2xl font-semibold text-[#1a1a1a]">
              İlgili Yazılar
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <BlogCard key={rp.slug} post={rp} />
              ))}
            </div>
          </section>
        )}
      </article>

      <NewsletterCTA
        heading="Blog Yazılarımızı Kaçırmayın"
        description="Yeni rehberler, koleksiyon hikayeleri ve sofra ilhamlarından haberdar olun."
      />
    </>
  );
}
