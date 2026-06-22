import { E_COLI_THRESHOLD } from "@/lib/usgs";

export function HoochIntro() {
  return (
    <section className="seo-intro">
      <p>
        We read the E. coli levels at three spots on the Chattahoochee so you know if the
        water&apos;s gross before you get in. Over {E_COLI_THRESHOLD} cfu/100 mL = poopy by EPA
        standards.
      </p>
    </section>
  );
}
