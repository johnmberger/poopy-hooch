import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/history`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
