import type { BacteriaReport } from "@/lib/bacteria/usgs";

export const BACTERIA_API = "/api/bacteria";

declare global {
  interface Window {
    __bacteriaReportPromise?: Promise<BacteriaReport>;
  }
}

async function fetchReport(): Promise<BacteriaReport> {
  const res = await fetch(BACTERIA_API);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `API returned ${res.status}`);
  }

  return data as BacteriaReport;
}

/** Reuse the fetch kicked off by BacteriaPrefetch, or start one now. Client only. */
export function getBacteriaReport(): Promise<BacteriaReport> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Bacteria data is only available in the browser"));
  }

  if (!window.__bacteriaReportPromise) {
    window.__bacteriaReportPromise = fetchReport();
  }

  return window.__bacteriaReportPromise;
}
