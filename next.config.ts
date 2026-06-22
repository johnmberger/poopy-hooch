import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["leaflet", "react-leaflet"],
  },
};

export default nextConfig;
