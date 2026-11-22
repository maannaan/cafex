import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@cafex/shared-types', 'three'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
