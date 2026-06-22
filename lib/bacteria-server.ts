import { fetchBacteriaReport, type BacteriaReport } from "@/lib/usgs";

export async function getServerBacteriaReport(): Promise<BacteriaReport | null> {
  try {
    return await fetchBacteriaReport();
  } catch {
    return null;
  }
}
