import { BuiltByFooter } from "@/components/BuiltByFooter";
import { HoochDashboard } from "@/components/HoochDashboard";
import { getServerBacteriaReport } from "@/lib/bacteria-server";
import { getStructuredData } from "@/lib/seo";

export const revalidate = 3600;

export default async function Home() {
  const initialReport = await getServerBacteriaReport();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
      />

      <article>
        <h1>Is the Hooch poopy?</h1>

        <HoochDashboard initialReport={initialReport} />
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
