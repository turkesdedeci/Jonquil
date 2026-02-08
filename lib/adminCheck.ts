// Check if Clerk is configured
const hasClerkConfig = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// Admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

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
    // Dynamically import Clerk to avoid errors when not configured
    const { currentUser } = await import('@clerk/nextjs/server');
    const user = await currentUser();

    if (!user) return false;

    return user.emailAddresses.some(
      email => ADMIN_EMAILS.includes(email.emailAddress)
    );
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
