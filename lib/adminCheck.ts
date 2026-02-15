import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';

// Server-side admin checks only require Clerk's server secret.
const hasClerkConfig = !!process.env.CLERK_SECRET_KEY;

// Admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_EMAIL_SET = new Set(ADMIN_EMAILS);
const allowDevAdminFallback =
  process.env.NODE_ENV === 'development' &&
  process.env.ALLOW_DEV_ADMIN === 'true';
// Reduced from 30s to 5s so revoked admin access takes effect quickly
const ADMIN_CACHE_TTL_MS = 5_000;
const adminCheckCache = new Map<string, { isAdmin: boolean; expiresAt: number }>();

function getCachedAdminResult(userId: string): boolean | null {
  const cached = adminCheckCache.get(userId);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    adminCheckCache.delete(userId);
    return null;
  }
  return cached.isAdmin;
}

function setCachedAdminResult(userId: string, isAdmin: boolean): void {
  adminCheckCache.set(userId, {
    isAdmin,
    expiresAt: Date.now() + ADMIN_CACHE_TTL_MS,
  });
}

function collectNormalizedEmails(values: unknown[]): string[] {
  const emails = new Set<string>();

  values.forEach((value) => {
    if (typeof value !== 'string') return;
    const normalized = value.trim().toLowerCase();
    if (normalized) {
      emails.add(normalized);
    }
  });

  return Array.from(emails);
}

function getEmailsFromSessionClaims(sessionClaims: unknown): string[] {
  if (!sessionClaims || typeof sessionClaims !== 'object') return [];
  const claims = sessionClaims as Record<string, unknown>;

  const values: unknown[] = [claims.email, claims.primary_email_address];
  const claimEmails = claims.email_addresses;
  if (Array.isArray(claimEmails)) {
    claimEmails.forEach((item) => {
      if (typeof item === 'string') {
        values.push(item);
        return;
      }
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        values.push(record.email_address, record.email, record.value);
      }
    });
  }

  return collectNormalizedEmails(values);
}

function getEmailsFromUser(user: unknown): string[] {
  if (!user || typeof user !== 'object') return [];
  const userRecord = user as {
    emailAddresses?: Array<{ emailAddress?: string | null }>;
    primaryEmailAddress?: { emailAddress?: string | null } | null;
  };

  const values: unknown[] = [];
  if (userRecord.primaryEmailAddress?.emailAddress) {
    values.push(userRecord.primaryEmailAddress.emailAddress);
  }
  if (Array.isArray(userRecord.emailAddresses)) {
    userRecord.emailAddresses.forEach((email) => {
      values.push(email?.emailAddress);
    });
  }

  return collectNormalizedEmails(values);
}

/**
 * Check if the current user is an admin
 * Returns false if Clerk is not configured or if user is not an admin
 */
export async function isAdmin(): Promise<boolean> {
  // If Clerk is not configured, no one is an admin
  if (!hasClerkConfig) {
    console.log('Admin check: Clerk not configured');
    return false;
  }

  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    const cachedResult = getCachedAdminResult(userId);
    if (cachedResult !== null) {
      return cachedResult;
    }

    const sessionClaimEmails = getEmailsFromSessionClaims(sessionClaims);

    // Optional local-development fallback:
    // If ADMIN_EMAILS is empty, only allow signed-in users when ALLOW_DEV_ADMIN=true.
    // This prevents accidental admin access in preview/staging environments.
    if (ADMIN_EMAIL_SET.size === 0) {
      setCachedAdminResult(userId, allowDevAdminFallback);
      return allowDevAdminFallback;
    }

    if (sessionClaimEmails.some((email) => ADMIN_EMAIL_SET.has(email))) {
      setCachedAdminResult(userId, true);
      return true;
    }

    let userEmails: string[] = [];

    try {
      const user = await currentUser();
      userEmails = getEmailsFromUser(user);
    } catch (error) {
      console.warn('Admin check: currentUser lookup failed, trying clerkClient fallback', error);
    }

    if (userEmails.length === 0) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        userEmails = getEmailsFromUser(user);
      } catch (error) {
        console.error('Admin check: clerkClient fallback failed', error);
      }
    }

    const adminStatus = userEmails.some((email) => ADMIN_EMAIL_SET.has(email));
    setCachedAdminResult(userId, adminStatus);
    return adminStatus;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Get admin emails list (for debugging)
 */
export function getAdminEmails(): string[] {
  return ADMIN_EMAILS;
}

/**
 * Check if Clerk is properly configured
 */
export function isClerkConfigured(): boolean {
  return hasClerkConfig;
}
