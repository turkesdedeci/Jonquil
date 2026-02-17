import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Image from 'next/image';
import Link from 'next/link';

const contentLinkClass =
  'font-medium text-[#0f3f44] underline decoration-[#d4af7a] decoration-[1.5px] underline-offset-[3px] transition-colors hover:text-[#0a2a2e]';

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
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2
      {...props}
      className={`mt-14 mb-5 text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-[#181818] ${
        props.className ?? ''
      }`}
    />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3
      {...props}
      className={`mt-10 mb-4 text-[1.35rem] font-semibold leading-snug text-[#202020] ${
        props.className ?? ''
      }`}
    />
  ),
  a: (props: React.ComponentProps<'a'>) => {
    const href = props.href || '';
    const isInternal = href.startsWith('/');
    if (isInternal) {
      return (
        <Link href={href} className={contentLinkClass}>
          {props.children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={contentLinkClass}
      >
        {props.children}
      </a>
    );
  },
};

export function BlogContent({ source }: { source: string }) {
  return (
    <div className="prose prose-base mx-auto max-w-[74ch] text-[#2f2f2f] md:prose-lg prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:text-[#1a1a1a] prose-p:my-5 prose-p:leading-[1.9] prose-li:text-[#444] prose-strong:text-[#1a1a1a] prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-img:rounded-xl prose-table:my-8 prose-table:w-full prose-th:border-b prose-th:border-[#e5dfd4] prose-th:bg-[#f6f2ea] prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-[#1f1f1f] prose-td:border-b prose-td:border-[#efe9df] prose-td:px-4 prose-td:py-3 prose-blockquote:border-l-[#d4af7a] prose-blockquote:text-[#4d4d4d]">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  );
}
