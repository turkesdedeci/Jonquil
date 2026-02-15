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
};

export default nextConfig;
