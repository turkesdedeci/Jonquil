import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

// No-cache headers for admin check
const noCacheHeaders = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { headers: noCacheHeaders });
    }

    const isAdmin = user.emailAddresses.some(
      email => ADMIN_EMAILS.includes(email.emailAddress)
    );

    return NextResponse.json({ isAdmin }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false }, { headers: noCacheHeaders });
  }
}
