'use client';

import { useEffect, useMemo, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function createBaseSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\u0131/g, 'i')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>('');
  const tocTitle = '\u0130\u00e7indekiler';

  const headings = useMemo<TocItem[]>(() => {
    const nextHeadings: TocItem[] = [];
    const slugCounts = new Map<string, number>();
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (!match) continue;

      const level = match[1].length;
      const text = match[2].trim();
      const baseId = createBaseSlug(text) || `section-${nextHeadings.length + 1}`;

      const seenCount = slugCounts.get(baseId) ?? 0;
      slugCounts.set(baseId, seenCount + 1);

      const id = seenCount === 0 ? baseId : `${baseId}-${seenCount}`;
      nextHeadings.push({ id, text, level });
    }

    return nextHeadings;
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="rounded-2xl border border-[#e8e6e3] bg-[#faf8f5] p-5" aria-label={tocTitle}>
      <h3 className="mb-3 text-sm font-semibold text-[#1a1a1a]">{tocTitle}</h3>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? '1rem' : 0 }}>
            <a
              href={`#${heading.id}`}
              className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                activeId === heading.id
                  ? 'bg-[#ece6db] font-medium text-[#0f3f44]'
                  : 'text-[#666] hover:bg-[#f2ede4] hover:text-[#0f3f44]'
              }`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.id);
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - 96;
                  window.scrollTo({ top, behavior: 'smooth' });
                  setActiveId(heading.id);
                }
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
