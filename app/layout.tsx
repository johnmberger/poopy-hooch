import type { Metadata } from "next";

import { BacteriaPrefetch } from "@/components/BacteriaPrefetch";
import "./globals.css";

const title = "Is the Hooch poopy?";
const description =
  "Real-time Chattahoochee River poop check. Is it safe to tube the Hooch today?";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Is the Hooch poopy",
    "Chattahoochee River",
    "shoot the Hooch",
    "tubing Atlanta",
    "E. coli",
    "river bacteria",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: { index: true, follow: true },
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
