import { BuiltByFooter } from "@/components/shared/BuiltByFooter";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UsgsBacterialertLink } from "@/components/shared/UsgsBacterialertLink";
import { HoochDashboard } from "@/components/dashboard/HoochDashboard";
import { getBrandFromParams } from "@/lib/brand/server";
import { getServerBacteriaHistoryPreview, getServerBacteriaReport } from "@/lib/bacteria/server";
import { getStructuredData } from "@/lib/seo";

export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const brand = getBrandFromParams(brandId);
  const [initialReport, historyPreview] = await Promise.all([
    getServerBacteriaReport(),
    getServerBacteriaHistoryPreview("P7D"),
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData(brand)) }}
      />

      <div className="theme-bar">
        <ThemeToggle />
      </div>

      <article>
        <h1>{brand.siteName}</h1>
        <p className="title-helper">{brand.titleHelper}</p>
        {brand.verdictPrompt && <p className="verdict-prompt">{brand.verdictPrompt}</p>}

        <HoochDashboard initialReport={initialReport} historyPreview={historyPreview} />
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
