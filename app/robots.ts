import type { MetadataRoute } from "next";

import { BRAND_IDS, brands } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: BRAND_IDS.map((id) => `${brands[id].siteUrl}/sitemap.xml`),
  };
}
