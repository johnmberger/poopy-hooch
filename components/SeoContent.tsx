import { E_COLI_THRESHOLD, STATIONS } from "@/lib/usgs";
import { faqItems } from "@/lib/seo";
import { linkifyBacterialert, UsgsBacterialertLink } from "@/components/UsgsBacterialertLink";

export function SeoContent() {
  return (
    <section className="seo-content" aria-label="About the Chattahoochee River bacteria check">
      <h2>Is it safe to shoot the Hooch?</h2>
      <p>
        &quot;Shoot the Hooch&quot; means floating or tubing down the Chattahoochee River through
        Atlanta. Before you grab a tube, it helps to know if the water&apos;s gross. This site
        pulls live E. coli estimates from the <UsgsBacterialertLink /> program at three
        stations in the Chattahoochee River National Recreation Area (CRNRA).
      </p>

      <h2>Chattahoochee River water quality today</h2>
      <p>
        This page tracks live E. coli at three <UsgsBacterialertLink /> stations along the main tubing
        stretch of the CRNRA. Check the verdict above for today&apos;s water quality before you
        float — bacteria can spike after rain even when the weather looks fine.
      </p>

      <h2>Chattahoochee River weather vs. water quality</h2>
      <p>
        People often search river weather before a float — but sunny skies don&apos;t always mean
        clean water. Rain upstream can spike bacteria for days. Check E. coli levels here before
        you shoot the Hooch; use a weather app for storms, lightning, and air temperature.
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
            <dd>{linkifyBacterialert(item.answer)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
