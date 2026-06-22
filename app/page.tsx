import { HoochDashboard } from "@/components/HoochDashboard";
import { HoochIntro } from "@/components/HoochIntro";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Is the Hooch poopy?",
  description:
    "Is the Chattahoochee River poopy today? Real-time E. coli check for Atlanta tubers.",
  applicationCategory: "HealthApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  about: {
    "@type": "BodyOfWater",
    name: "Chattahoochee River",
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>Is the Hooch poopy?</h1>

      <HoochDashboard intro={<HoochIntro />} />

      <noscript>
        <p className="noscript">
          Need JS for live poop levels. Or just check{" "}
          <a href="https://ga.water.usgs.gov/bacteria/">USGS BacteriALERT</a>.
        </p>
      </noscript>
    </main>
  );
}
