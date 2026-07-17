import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["leaflet", "react-leaflet", "@vercel/analytics", "@vercel/speed-insights"],
  },
};

export default nextConfig;
