import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily ignore TypeScript errors during build
  // TODO: Fix all type errors and remove this option
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
