import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Security headers to add to all responses
const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // XSS protection for older browsers
  'X-XSS-Protection': '1; mode=block',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy - disable unnecessary features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // HTTPS only (uncomment in production with HTTPS)
  // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Wrap clerkMiddleware with security headers
export default clerkMiddleware(async (auth, request) => {
  const response = NextResponse.next();

  // Add security headers to all responses
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};