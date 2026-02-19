import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR enabled for Lambda deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
