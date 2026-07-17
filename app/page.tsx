import { BuiltByFooter } from "@/components/BuiltByFooter";
import { UsgsBacterialertLink } from "@/components/UsgsBacterialertLink";
import { HoochDashboard } from "@/components/HoochDashboard";
import { getRequestBrand } from "@/lib/brand-server";
import { getServerBacteriaHistory, getServerBacteriaReport } from "@/lib/bacteria-server";
import { getStructuredData } from "@/lib/seo";

export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ poop?: string }>;
}) {
  const { poop } = await searchParams;
  const brand = await getRequestBrand();
  const [initialReport, historyPreview] = await Promise.all([
    getServerBacteriaReport(),
    getServerBacteriaHistory("P7D"),
  ]);
  const forcePoop = process.env.NODE_ENV === "development" && poop === "1";

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData(brand)) }}
      />

      <article>
        <h1>{brand.siteName}</h1>
        <p className="title-helper">{brand.titleHelper}</p>
        {brand.verdictPrompt && <p className="verdict-prompt">{brand.verdictPrompt}</p>}

        <HoochDashboard
          initialReport={initialReport}
          historyPreview={historyPreview}
          forcePoop={forcePoop}
        />
      </article>

      <BuiltByFooter />

      <noscript>
        <p className="noscript">
          Is it safe to shoot the Hooch today? This page needs JavaScript for the live map and
          bacteria check. See official readings at <UsgsBacterialertLink />.
        </p>
      </noscript>
    </main>
  );
}
