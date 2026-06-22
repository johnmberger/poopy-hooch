import { BuiltByFooter } from "@/components/BuiltByFooter";
import { HoochDashboard } from "@/components/HoochDashboard";
import { LearnMore } from "@/components/LearnMore";
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

      <h1>Is the Hooch poopy?</h1>

      <HoochDashboard initialReport={initialReport} />

      <LearnMore />

      <BuiltByFooter />

      <noscript>
        <p className="noscript">
          The map needs JavaScript. Check{" "}
          <a href="https://ga.water.usgs.gov/bacteria/">USGS BacteriALERT</a> for live data.
        </p>
      </noscript>
    </main>
  );
}
