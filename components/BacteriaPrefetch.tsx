import Script from "next/script";

import { BACTERIA_API } from "@/lib/bacteria-cache";

/** Start the bacteria fetch before React hydrates. */
export function BacteriaPrefetch() {
  const script = `window.__bacteriaReportPromise=fetch(${JSON.stringify(BACTERIA_API)}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||"API "+r.status);return d;});});`;

  return (
    <Script id="bacteria-prefetch" strategy="beforeInteractive">
      {script}
    </Script>
  );
}
