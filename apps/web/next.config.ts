import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@cafex/shared-types', 'three', '@react-three/fiber', '@react-three/drei'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
  },
};

export default nextConfig;
