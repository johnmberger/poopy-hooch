import type { MetadataRoute } from "next";

import { getRequestBrand } from "@/lib/brand/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brand = await getRequestBrand();

  return [
    {
      url: brand.siteUrl,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${brand.siteUrl}/history`,
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
