import { NextResponse } from "next/server";

import { getServerBacteriaHistory } from "@/lib/bacteria/server";
import { JSON_CACHE_CONTROL } from "@/lib/bacteria/cache-config";
import type { HistoryPeriod } from "@/lib/bacteria/usgs";

export const revalidate = 3600;

const VALID_PERIODS = new Set<HistoryPeriod>(["P7D", "P30D", "P120D"]);

export async function GET(request: Request) {
  const period = new URL(request.url).searchParams.get("period") ?? "P7D";

  if (!VALID_PERIODS.has(period as HistoryPeriod)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const report = await getServerBacteriaHistory(period as HistoryPeriod);
    if (!report) {
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 502 });
    }
    return NextResponse.json(report, {
      headers: {
        "Cache-Control": JSON_CACHE_CONTROL,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
