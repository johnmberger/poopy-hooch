import type { Metadata } from "next";

import { BacteriaPrefetch } from "@/components/BacteriaPrefetch";
import {
  siteDescription,
  siteKeywords,
  siteName,
  siteTitle,
  siteUrl,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [...siteKeywords],
  applicationName: siteName,
  category: "health",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://waterservices.usgs.gov" />
        <link rel="dns-prefetch" href="https://waterservices.usgs.gov" />
        <link rel="preconnect" href="https://basemaps.cartocdn.com" />
      </head>
      <body>
        <BacteriaPrefetch />
        {children}
      </body>
    </html>
  );
}
