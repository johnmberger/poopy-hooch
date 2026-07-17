import type { Metadata } from "next";

import { brandStaticParams } from "@/lib/brand";
import { getBrandFromParams } from "@/lib/brand/server";
import { siteKeywords } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return brandStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: brandId } = await params;
  const brand = getBrandFromParams(brandId);

  return {
    metadataBase: new URL(brand.siteUrl),
    title: {
      default: brand.siteTitle,
      template: `%s | ${brand.siteName}`,
    },
    description: brand.siteDescription,
    keywords: [...siteKeywords],
    applicationName: brand.siteName,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: brand.ogTitle,
      description: brand.ogSubtitle ?? brand.siteDescription,
      url: "/",
      siteName: brand.siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: brand.ogTitle,
      description: brand.ogSubtitle ?? brand.siteDescription,
    },
  };
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
