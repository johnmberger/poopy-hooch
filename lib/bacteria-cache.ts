import { parseUsgsResponse, USGS_IV_URL, type UsgsIvResponse } from "@/lib/usgs";

declare global {
  interface Window {
    __bacteriaRawPromise?: Promise<unknown>;
  }
}

/** Reuse the fetch kicked off by BacteriaPrefetch, or start one now. Client only. */
export function getRawBacteriaPromise(): Promise<unknown> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Bacteria data is only available in the browser"));
  }

  if (!window.__bacteriaRawPromise) {
    window.__bacteriaRawPromise = fetch(USGS_IV_URL, {
      headers: { Accept: "application/json" },
    }).then((res) => {
      if (!res.ok) throw new Error(`USGS API returned ${res.status}`);
      return res.json();
    });
  }

  return window.__bacteriaRawPromise;
}

export async function getBacteriaReport() {
  const raw = (await getRawBacteriaPromise()) as UsgsIvResponse;
  return parseUsgsResponse(raw);
}
