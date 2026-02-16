import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/blog/types';

export function BlogCard({ post }: { post: BlogPost }) {
  const date = new Date(post.publishedAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white transition-shadow hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0f3f44] backdrop-blur-sm">
              {post.category}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-[#999]">
          <time dateTime={post.publishedAt}>{date}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingTime}</span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="mb-2 text-lg font-semibold text-[#1a1a1a] transition-colors group-hover:text-[#0f3f44]">
            {post.title}
          </h2>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#666]">
          {post.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#faf8f5] px-2 py-0.5 text-xs text-[#999]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
