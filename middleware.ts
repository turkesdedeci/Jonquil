import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// Check if Clerk is configured
const hasClerkConfig = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// Content Security Policy
// Allows: self, Clerk auth, Supabase storage, iyzico payment
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === 'production' ? [] : ["'unsafe-eval'"]),
  'https://*.clerk.accounts.dev',
  'https://challenges.cloudflare.com',
  'https://static.iyzipay.com',
  'https://*.iyzipay.com',
  'https://*.iyzico.com',
];

const cspDirectives = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://img.clerk.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.supabase.co https://api.iyzipay.com https://*.iyzipay.com https://*.iyzico.com wss://*.supabase.co",
  "frame-src 'self' https://*.iyzipay.com https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

// Security headers to add to all responses
const securityHeaders: Record<string, string> = {
  // Content Security Policy
  'Content-Security-Policy': cspDirectives,
  // Prevent clickjacking (redundant with CSP frame-ancestors but good for older browsers)
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // XSS protection for older browsers
  'X-XSS-Protection': '1; mode=block',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy - disable unnecessary features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Add HSTS header in production (HTTPS required)
if (process.env.NODE_ENV === 'production') {
  // Strict Transport Security - force HTTPS for 1 year, include subdomains
  securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
}

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
}

// Simple middleware without Clerk
function simpleMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers to all responses
  applySecurityHeaders(response);

  return response;
}

// Wrap clerkMiddleware with security headers (only if Clerk is configured)
const clerkMiddlewareHandler = clerkMiddleware(async (auth, request) => {
  const response = NextResponse.next();

  // Add security headers to all responses
  applySecurityHeaders(response);

  return response;
});

// Export the appropriate middleware based on Clerk configuration
export default hasClerkConfig ? clerkMiddlewareHandler : simpleMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
