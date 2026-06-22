import Script from "next/script";

import { USGS_IV_URL } from "@/lib/usgs";

/** Start the USGS fetch before React hydrates. */
export function BacteriaPrefetch() {
  const script = `window.__bacteriaRawPromise=fetch(${JSON.stringify(USGS_IV_URL)},{headers:{Accept:"application/json"}}).then(function(r){if(!r.ok)throw new Error("USGS "+r.status);return r.json();});`;

  return (
    <Script id="bacteria-prefetch" strategy="beforeInteractive">
      {script}
    </Script>
  );
}
