import type { Metadata, Viewport } from "next";
import { AnalyticsDeferred } from "@/components/shared/AnalyticsDeferred";
import { getRequestBrand } from "@/lib/brand/server";
import { siteKeywords } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getRequestBrand();

  return {
    metadataBase: new URL(brand.siteUrl),
    title: {
      default: brand.siteTitle,
      template: `%s | ${brand.siteName}`,
    },
    description: brand.siteDescription,
    keywords: [...siteKeywords],
    applicationName: brand.siteName,
    category: "health",
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
    other: {
      "geo.region": "US-GA",
      "geo.placename": "Atlanta",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnalyticsDeferred />
      </body>
    </html>
  );
}
