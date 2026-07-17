import type { Metadata } from "next";
import Link from "next/link";

import { BuiltByFooter } from "@/components/BuiltByFooter";
import { EcoliTimeline } from "@/components/EcoliTimeline";
import { UsgsBacterialertLink } from "@/components/UsgsBacterialertLink";
import { getRequestBrand } from "@/lib/brand-server";
import { getServerBacteriaHistory } from "@/lib/bacteria-server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getRequestBrand();

  return {
    title: "Chattahoochee River bacteria history",
    description:
      "Estimated E. coli levels over the past week, month, and four months at Medlock Bridge, Powers Ferry, and Paces Ferry on the Chattahoochee River.",
    alternates: {
      canonical: "/history",
    },
    openGraph: {
      title: `Chattahoochee River bacteria history | ${brand.siteName}`,
      description:
        "Timeline of estimated E. coli levels at three USGS BacteriALERT stations on the Chattahoochee River.",
      url: "/history",
    },
  };
}

export default async function HistoryPage() {
  const initialHistory = await getServerBacteriaHistory("P7D");

  return (
    <main>
      <article>
        <p className="page-back">
          <Link href="/">← Today&apos;s check</Link>
        </p>

        <h1>Recent levels</h1>
        <p className="title-helper">Chattahoochee River E. coli history · Atlanta, Georgia</p>

        <EcoliTimeline initialHistory={initialHistory} />
      </article>

      <BuiltByFooter />

      <noscript>
        <p className="noscript">
          See official readings at <UsgsBacterialertLink />.
        </p>
      </noscript>
    </main>
  );
}
