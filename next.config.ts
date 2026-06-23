import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // ESLint is not installed in this project.
    // This skips the ESLint step during `next build` so the build succeeds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
