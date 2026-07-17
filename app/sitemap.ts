import type { MetadataRoute } from "next";

import { BRAND_IDS, brands } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return BRAND_IDS.flatMap((id) => {
    const brand = brands[id];
    return [
      {
        url: brand.siteUrl,
        changeFrequency: "hourly" as const,
        priority: 1,
      },
      {
        url: `${brand.siteUrl}/history`,
        changeFrequency: "hourly" as const,
        priority: 0.8,
      },
    ];
  });
}
