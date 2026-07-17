import type { Metadata, Viewport } from "next";

import { AnalyticsDeferred } from "@/components/shared/AnalyticsDeferred";
import { themeInitScript } from "@/lib/theme-init";
import "./globals.css";

export const metadata: Metadata = {
  category: "health",
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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
        <AnalyticsDeferred />
      </body>
    </html>
  );
}
