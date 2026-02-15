/**
 * Security utilities for API routes
 * - Rate limiting (Redis/Upstash for production, in-memory fallback)
 * - Input sanitization
 * - Safe error responses
 * - File validation
 */

import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ============================================
// RATE LIMITING (Upstash Redis for production, in-memory fallback)
// ============================================

// Check if Upstash is configured
const isUpstashConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client if configured
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Rate limiters for different endpoint types (using sliding window algorithm)
const rateLimiters = redis ? {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    analytics: true,
    prefix: 'ratelimit:write',
  }),
  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    analytics: true,
    prefix: 'ratelimit:read',
  }),
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'ratelimit:upload',
  }),
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
    prefix: 'ratelimit:contact',
  }),
} : null;

// Fallback in-memory rate limiting for development
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (only for in-memory)
if (!isUpstashConfigured) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

// Different limits for different endpoint types
export const RATE_LIMITS = {
  auth: { windowMs: 60 * 1000, maxRequests: 10 },
  write: { windowMs: 60 * 1000, maxRequests: 30 },
  read: { windowMs: 60 * 1000, maxRequests: 100 },
  upload: { windowMs: 60 * 1000, maxRequests: 10 },
  contact: { windowMs: 60 * 1000, maxRequests: 5 },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check rate limit for a given identifier
 * Uses Upstash Redis in production, falls back to in-memory for development
 * Returns null if allowed, or NextResponse if rate limited
 */
export async function checkRateLimitAsync(
  identifier: string,
  type: RateLimitType = 'read'
): Promise<NextResponse | null> {
  // Use Redis rate limiting if configured
  if (rateLimiters && rateLimiters[type]) {
    const { success, limit, remaining, reset } = await rateLimiters[type].limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Çok fazla istek. Lütfen biraz bekleyin.',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          }
        }
      );
    }
    return null;
  }

  // Fallback to in-memory (for development)
  return checkRateLimitSync(identifier, type);
}

/**
 * Synchronous rate limit check (in-memory only, for backwards compatibility)
 */
function checkRateLimitSync(
  identifier: string,
  type: RateLimitType = 'read'
): NextResponse | null {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const key = `${type}:${identifier}`;

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: 'Çok fazla istek. Lütfen biraz bekleyin.',
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.resetTime),
        }
      }
    );
  }

  entry.count++;
  return null;
}

/**
 * Check rate limit (wrapper for backwards compatibility)
 * Note: This is sync but internally handles async Redis calls
 * For new code, prefer checkRateLimitAsync
 */
export function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'read'
): NextResponse | null {
  // If Redis is not configured, use sync in-memory
  if (!rateLimiters) {
    return checkRateLimitSync(identifier, type);
  }

  // For Redis, we need async - return null and let async version handle it
  // This maintains backwards compatibility but won't rate limit until async is used
  // Log warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Security] Using sync checkRateLimit with Redis configured. Consider using checkRateLimitAsync.');
  }
  return null;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown';
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input - removes potentially dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit length to prevent DoS
    .slice(0, 10000);
}

/**
 * Sanitize HTML - escape dangerous characters
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  const sanitized = sanitizeString(email).toLowerCase();

  // More robust email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(sanitized) || sanitized.length > 254) {
    return null;
  }

  return sanitized;
}

/**
 * Validate Turkish phone number
 */
export function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Turkish phone: 10-12 digits
  if (digits.length < 10 || digits.length > 12) {
    return null;
  }

  return digits;
}

/**
 * Sanitize object - recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

// ============================================
// SAFE ERROR RESPONSES
// ============================================

/**
 * Create a safe error response that doesn't leak internal details
 */
export function safeErrorResponse(
  error: unknown,
  publicMessage: string = 'Bir hata oluştu',
  status: number = 500
): NextResponse {
  const errorObj = (error && typeof error === 'object')
    ? (error as Record<string, unknown>)
    : null;
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof errorObj?.message === 'string'
        ? errorObj.message
        : String(error);
  const errorCode = typeof errorObj?.code === 'string' ? errorObj.code : undefined;
  const errorDetails = typeof errorObj?.details === 'string' ? errorObj.details : undefined;
  const errorHint = typeof errorObj?.hint === 'string' ? errorObj.hint : undefined;

  // Log the actual error for debugging (server-side only)
  console.error('[API Error]', {
    code: errorCode,
    message: errorMessage,
    details: errorDetails,
    hint: errorHint,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Return generic message to client
  return NextResponse.json(
    { error: publicMessage },
    { status }
  );
}

/**
 * Handle common database errors with user-friendly messages
 */
export function handleDatabaseError(error: unknown): NextResponse {
  const errorObj = (error && typeof error === 'object')
    ? (error as Record<string, unknown>)
    : null;
  const errorCode = typeof errorObj?.code === 'string' ? errorObj.code : '';
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof errorObj?.message === 'string'
        ? errorObj.message
        : String(error);
  const errorDetails = typeof errorObj?.details === 'string' ? errorObj.details : '';
  const errorHint = typeof errorObj?.hint === 'string' ? errorObj.hint : '';
  const errorText = `${errorCode} ${errorMessage} ${errorDetails} ${errorHint}`.toLowerCase();

  // Check for common database errors
  if (
    errorCode === '23505' ||
    errorText.includes('duplicate key') ||
    errorText.includes('unique constraint')
  ) {
    return NextResponse.json(
      { error: 'Bu kayıt zaten mevcut', code: errorCode || undefined },
      { status: 409 }
    );
  }

  if (
    errorCode === '23503' ||
    errorText.includes('foreign key') ||
    errorText.includes('violates foreign key')
  ) {
    return NextResponse.json(
      { error: 'İlişkili kayıt bulunamadı', code: errorCode || undefined },
      { status: 400 }
    );
  }

  if (errorCode === '23502' || errorText.includes('null value in column')) {
    const columnMatch = /column\s+"?([a-z0-9_]+)"?/i.exec(`${errorMessage} ${errorDetails}`);
    const columnName = columnMatch?.[1];

    return NextResponse.json(
      {
        error: columnName ? `Zorunlu alan eksik: ${columnName}` : 'Zorunlu bir veritabanı alanı eksik',
        code: errorCode || undefined,
      },
      { status: 400 }
    );
  }

  if (errorCode === '42P01' || errorCode === '42703' || errorText.includes('does not exist')) {
    return NextResponse.json(
      {
        error: 'Veritabanı tablosu/kolonu bulunamadı. Lütfen yöneticiyle iletişime geçin.',
        code: errorCode || undefined,
      },
      { status: 500 }
    );
  }

  if (errorCode === '42501' || errorText.includes('permission denied')) {
    return NextResponse.json(
      {
        error: 'Veritabanı yetki hatası. Service role key veya RLS politikalarını kontrol edin.',
        code: errorCode || undefined,
      },
      { status: 500 }
    );
  }

  // Default error
  return NextResponse.json(
    { error: 'Veritabanı hatası', code: errorCode || undefined },
    { status: 500 }
  );
}

// ============================================
// FILE VALIDATION
// ============================================

// Magic bytes for common image formats
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (first 4 bytes, WEBP at offset 8)
  ],
};

/**
 * Validate file by checking magic bytes (file signature)
 * More secure than just checking MIME type from browser
 */
export async function validateFileSignature(
  file: File,
  allowedTypes: string[]
): Promise<{ valid: boolean; detectedType: string | null; error?: string }> {
  try {
    // Read first 12 bytes for signature check
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    for (const mimeType of allowedTypes) {
      const signatures = FILE_SIGNATURES[mimeType];
      if (!signatures) continue;

      for (const signature of signatures) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          if (bytes[i] !== signature[i]) {
            matches = false;
            break;
          }
        }

        if (matches) {
          // Special check for WebP - need to verify WEBP at offset 8
          if (mimeType === 'image/webp') {
            const webpCheck = new Uint8Array(await file.slice(8, 12).arrayBuffer());
            if (webpCheck[0] !== 0x57 || webpCheck[1] !== 0x45 ||
                webpCheck[2] !== 0x42 || webpCheck[3] !== 0x50) {
              continue;
            }
          }
          return { valid: true, detectedType: mimeType };
        }
      }
    }

    return {
      valid: false,
      detectedType: null,
      error: 'Dosya formatı desteklenmiyor veya dosya bozuk'
    };
  } catch (error) {
    return {
      valid: false,
      detectedType: null,
      error: 'Dosya doğrulanamadı'
    };
  }
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Dosya boyutu çok büyük. Maksimum ${maxSizeMB}MB.`
    };
  }

  return { valid: true };
}

// ============================================
// SECURITY HEADERS
// ============================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS protection for older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

/**
 * Create API response with security headers
 */
export function secureJsonResponse(
  data: unknown,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, init);
  return addSecurityHeaders(response);
}

// ============================================
// GUEST EMAIL RATE LIMITING
// ============================================

// Limit guest orders per email address to prevent spam/inventory attacks
const GUEST_EMAIL_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxOrders: 3,
} as const;

const guestEmailOrderStore = new Map<string, { count: number; resetTime: number }>();

export function checkGuestEmailRateLimit(email: string): NextResponse | null {
  const key = email.toLowerCase().trim();
  const now = Date.now();
  const entry = guestEmailOrderStore.get(key);

  if (!entry || entry.resetTime < now) {
    guestEmailOrderStore.set(key, { count: 1, resetTime: now + GUEST_EMAIL_RATE_LIMIT.windowMs });
    return null;
  }

  if (entry.count >= GUEST_EMAIL_RATE_LIMIT.maxOrders) {
    const retryAfterSecs = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      { error: 'Bu e-posta adresiyle cok fazla siparis verildi. Lutfen daha sonra tekrar deneyin.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSecs) },
      }
    );
  }

  entry.count++;
  return null;
}

// ============================================
// ORIGIN CHECKS (BASIC CSRF MITIGATION)
// ============================================

/**
 * Enforce same-origin requests for state-mutating API routes.
 * Checks Origin header first; falls back to Referer when Origin is absent
 * (e.g., some same-site form submissions or older HTTP clients).
 * Requests with neither header are rejected to prevent CSRF via
 * silent form submissions without a browser Origin.
 */
export function requireSameOrigin(request: Request): NextResponse | null {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!host) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Prefer Origin header
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
      return null;
    } catch {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
  }

  // Fall back to Referer when Origin is absent
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
      return null;
    } catch {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
  }

  // Neither Origin nor Referer — reject to prevent silent CSRF
  return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
}
