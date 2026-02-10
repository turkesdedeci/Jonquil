import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, isClerkConfigured } from '@/lib/adminCheck';
import { checkRateLimitAsync, getClientIP } from '@/lib/security';

// No-cache headers for admin check
const noCacheHeaders = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
};

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResponse = await checkRateLimitAsync(clientIP, 'read');
  if (rateLimitResponse) return rateLimitResponse;

  // If Clerk is not configured, return false immediately with reason
  if (!isClerkConfigured()) {
    console.log('Admin check: Clerk not configured');
    return NextResponse.json({ isAdmin: false, reason: 'auth_not_configured' }, { headers: noCacheHeaders });
  }

  try {
    const adminStatus = await isAdmin();
    return NextResponse.json({ isAdmin: adminStatus }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false, error: 'auth_error' }, { headers: noCacheHeaders });
  }
}
