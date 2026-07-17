import type { MetadataRoute } from "next";

import { getRequestBrand } from "@/lib/brand/server";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brand = await getRequestBrand();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${brand.siteUrl}/sitemap.xml`,
  };
}
