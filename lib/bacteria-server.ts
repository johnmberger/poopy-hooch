import { unstable_cache } from "next/cache";

import { fetchBacteriaHistory, fetchBacteriaReport, type BacteriaHistoryReport, type HistoryPeriod } from "@/lib/usgs";

const getCachedReport = unstable_cache(fetchBacteriaReport, ["bacteria-report"], {
  revalidate: 3600,
});

const getCachedHistory = unstable_cache(
  (period: HistoryPeriod) => fetchBacteriaHistory(period),
  ["bacteria-history"],
  { revalidate: 3600 },
);

export async function getServerBacteriaReport() {
  try {
    return await getCachedReport();
  } catch {
    return null;
  }
}

export async function getServerBacteriaHistory(
  period: HistoryPeriod = "P7D",
): Promise<BacteriaHistoryReport | null> {
  try {
    return await getCachedHistory(period);
  } catch {
    return null;
  }
}
