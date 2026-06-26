import { BuiltByFooter } from "@/components/BuiltByFooter";
import { HoochDashboard } from "@/components/HoochDashboard";
import { getServerBacteriaReport } from "@/lib/bacteria-server";
import { getStructuredData, titleHelper } from "@/lib/seo";

export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ poop?: string }>;
}) {
  const { poop } = await searchParams;
  const initialReport = await getServerBacteriaReport();
  const forcePoop = process.env.NODE_ENV === "development" && poop === "1";

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
      />

      <article>
        <h1>Is the Hooch poopy?</h1>
        <p className="title-helper">{titleHelper}</p>

        <HoochDashboard initialReport={initialReport} forcePoop={forcePoop} />
      </article>

      <BuiltByFooter />

      <noscript>
        <p className="noscript">
          Is it safe to shoot the Hooch today? This page needs JavaScript for the live map and
          bacteria check. See official readings at{" "}
          <a href="https://ga.water.usgs.gov/bacteria/">USGS BacteriALERT</a>.
        </p>
      </noscript>
    </main>
  );
}
