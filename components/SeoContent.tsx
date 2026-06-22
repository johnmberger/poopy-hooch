import { E_COLI_THRESHOLD, STATIONS } from "@/lib/usgs";
import { faqItems } from "@/lib/seo";

export function SeoContent() {
  return (
    <section className="seo-content" aria-label="About the Chattahoochee bacteria check">
      <h2>Is it safe to tube the Chattahoochee River?</h2>
      <p>
        &quot;Shoot the Hooch&quot; means floating or tubing down the Chattahoochee River through
        Atlanta. Before you grab a tube, it helps to know if the water&apos;s gross. This site
        pulls live E. coli estimates from the{" "}
        <a href="https://ga.water.usgs.gov/bacteria/">USGS BacteriALERT</a> program at three
        stations in the Chattahoochee River National Recreation Area (CRNRA).
      </p>

      <h2>Where we check</h2>
      <ul>
        {STATIONS.map((station) => (
          <li key={station.id}>
            <strong>{station.name}</strong> — {station.section}
          </li>
        ))}
      </ul>
      <p>
        Popular put-ins like Jones Bridge, Garrard&apos;s Landing, and Powers Island fall along
        this stretch. Over {E_COLI_THRESHOLD} cfu/100 mL = poopy by EPA standards.
      </p>

      <h2>FAQ</h2>
      <dl className="seo-faq">
        {faqItems.map((item) => (
          <div key={item.question} className="seo-faq-item">
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
