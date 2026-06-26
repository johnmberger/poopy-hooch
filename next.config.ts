import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["leaflet", "react-leaflet", "@vercel/analytics"],
  },
};

export default nextConfig;
