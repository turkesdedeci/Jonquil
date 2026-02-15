import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Supabase
  images: {
    qualities: [75, 85, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js inline scripts + iyzico iframe
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox-static.iyzipay.com https://static.iyzipay.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              // iyzico checkout iframe
              "frame-src https://sandbox-checkoutform.iyzipay.com https://checkoutform.iyzipay.com",
              "connect-src 'self' https://*.supabase.co https://api.clerk.com https://clerk.*.lcl.dev wss://*.supabase.co",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://sandbox-checkoutform.iyzipay.com https://checkoutform.iyzipay.com",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
