import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // For GitHub Pages deployment to repository path
  basePath: "/axiorreportingdashboard",
  assetPrefix: "/axiorreportingdashboard/",
};

export default nextConfig;
