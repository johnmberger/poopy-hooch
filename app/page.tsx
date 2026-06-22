import { BuiltByFooter } from "@/components/BuiltByFooter";
import { HoochDashboard } from "@/components/HoochDashboard";
import { HoochIntro } from "@/components/HoochIntro";
import { SeoContent } from "@/components/SeoContent";
import { getStructuredData } from "@/lib/seo";

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
      />

      <h1>Is the Hooch poopy?</h1>

      <HoochDashboard intro={<HoochIntro />} />

      <SeoContent />

      <BuiltByFooter />

      <noscript>
        <p className="noscript">
          Need JS for live poop levels. Or just check{" "}
          <a href="https://ga.water.usgs.gov/bacteria/">USGS BacteriALERT</a>.
        </p>
      </noscript>
    </main>
  );
}
