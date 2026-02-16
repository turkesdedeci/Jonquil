import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import Image from 'next/image';
import Link from 'next/link';

const components = {
  img: (props: React.ComponentProps<'img'>) => (
    <span className="my-6 block overflow-hidden rounded-xl">
      <Image
        src={typeof props.src === 'string' ? props.src : ''}
        alt={props.alt || ''}
        width={800}
        height={450}
        className="w-full object-cover"
      />
    </span>
  ),
  a: (props: React.ComponentProps<'a'>) => {
    const href = props.href || '';
    const isInternal = href.startsWith('/');
    if (isInternal) {
      return (
        <Link href={href} className="text-[#0f3f44] underline decoration-[#d4af7a] underline-offset-2 hover:text-[#0a2a2e]">
          {props.children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#0f3f44] underline decoration-[#d4af7a] underline-offset-2 hover:text-[#0a2a2e]"
      >
        {props.children}
      </a>
    );
  },
};

export function BlogContent({ source }: { source: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-[#1a1a1a] prose-p:text-[#444] prose-p:leading-relaxed prose-li:text-[#444] prose-strong:text-[#1a1a1a] prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3 prose-ul:my-4 prose-ol:my-4 prose-li:my-1">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            ],
          },
        }}
      />
    </div>
  );
}
