/**
 * Boot-time environment variable validation.
 * Called from instrumentation.ts so missing vars surface immediately
 * rather than silently failing deep in route handlers.
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
] as const;

const OPTIONAL_BUT_WARNED_ENV_VARS = [
  'ADMIN_EMAILS',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const;

export function validateEnvVars(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const msg = `[env-check] KRITIK: Zorunlu env variable eksik: ${missing.join(', ')}`;
    console.error(msg);
    // Crash fast in production so the issue is immediately visible
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
  }

  for (const key of OPTIONAL_BUT_WARNED_ENV_VARS) {
    if (!process.env[key]) {
      console.warn(`[env-check] Uyari: Opsiyonel env variable eksik: ${key}`);
    }
  }
}
