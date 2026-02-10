import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build (handled separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow external images from Supabase
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
