const FALLBACK_SITE_URL = 'https://www.jonquilstudio.co';

export const SITE_NAME = 'Jonquil Studio';

function normalizeSiteUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL);
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, getSiteUrl()).toString();
}

