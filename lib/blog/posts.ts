import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { BlogPost, BlogCategory, BlogTag } from './types';
import { slugify } from './slugify';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function getPostFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.mdx'));
}

function parsePost(fileName: string): BlogPost {
  const filePath = path.join(CONTENT_DIR, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    slug: data.slug || fileName.replace(/\.mdx$/, ''),
    title: data.title || '',
    description: data.description || '',
    publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : '',
    updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
    coverImage: data.coverImage || '',
    category: data.category || '',
    tags: data.tags || [],
    relatedProducts: data.relatedProducts || [],
    author: data.author || 'Jonquil Studio',
    content,
    readingTime: stats.text.replace('read', 'okuma'),
  };
}

export function getAllPosts(): BlogPost[] {
  return getPostFiles()
    .map(parsePost)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getAllCategories(): BlogCategory[] {
  const posts = getAllPosts();
  const categoryMap = new Map<string, { name: string; count: number }>();

  for (const post of posts) {
    if (!post.category) continue;
    const slug = slugify(post.category);
    const existing = categoryMap.get(slug);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(slug, { name: post.category, count: 1 });
    }
  }

  const categoryDescriptions: Record<string, string> = {
    'urun-rehberi': 'Jonquil Studio ürünleri hakkında detaylı bilgi, bakım ve kullanım rehberleri.',
    'yasam-tarzi': 'Sofra düzeni, ev dekorasyonu ve yaşam tarzı ile ilgili ilham verici içerikler.',
  };

  return Array.from(categoryMap.entries()).map(([slug, { name, count }]) => ({
    slug,
    name,
    description: categoryDescriptions[slug] || `${name} kategorisindeki blog yazıları.`,
    postCount: count,
  }));
}

export function getAllTags(): BlogTag[] {
  const posts = getAllPosts();
  const tagMap = new Map<string, { name: string; count: number }>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = slugify(tag);
      const existing = tagMap.get(slug);
      if (existing) {
        existing.count++;
      } else {
        tagMap.set(slug, { name: tag, count: 1 });
      }
    }
  }

  return Array.from(tagMap.entries()).map(([slug, { name, count }]) => ({
    slug,
    name,
    postCount: count,
  }));
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return getAllPosts().filter((post) => slugify(post.category) === categorySlug);
}

export function getPostsByTag(tagSlug: string): BlogPost[] {
  return getAllPosts().filter((post) =>
    post.tags.some((tag) => slugify(tag) === tagSlug)
  );
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];

  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  // Score posts by shared tags and same category
  const scored = allPosts.map((post) => {
    let score = 0;
    if (post.category === current.category) score += 2;
    for (const tag of post.tags) {
      if (current.tags.includes(tag)) score += 1;
    }
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}
