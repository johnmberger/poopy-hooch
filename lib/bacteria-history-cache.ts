import type { BacteriaHistoryReport, HistoryPeriod } from "@/lib/usgs";

export const BACTERIA_HISTORY_API = "/api/bacteria/history";

declare global {
  interface Window {
    __bacteriaHistoryPromises?: Partial<Record<HistoryPeriod, Promise<BacteriaHistoryReport>>>;
  }
}

async function fetchHistory(period: HistoryPeriod): Promise<BacteriaHistoryReport> {
  const res = await fetch(`${BACTERIA_HISTORY_API}?period=${period}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `API returned ${res.status}`);
  }

  return data as BacteriaHistoryReport;
}

/** Reuse in-flight or completed fetches per period. Client only. */
export function getBacteriaHistory(period: HistoryPeriod): Promise<BacteriaHistoryReport> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("History is only available in the browser"));
  }

  if (!window.__bacteriaHistoryPromises) {
    window.__bacteriaHistoryPromises = {};
  }

  if (!window.__bacteriaHistoryPromises[period]) {
    window.__bacteriaHistoryPromises[period] = fetchHistory(period);
  }

  return window.__bacteriaHistoryPromises[period]!;
}

/** Seed the client cache after SSR so the first range toggle doesn't refetch. */
export function seedBacteriaHistory(report: BacteriaHistoryReport): void {
  if (typeof window === "undefined") return;

  if (!window.__bacteriaHistoryPromises) {
    window.__bacteriaHistoryPromises = {};
  }

  window.__bacteriaHistoryPromises[report.period] = Promise.resolve(report);
}
