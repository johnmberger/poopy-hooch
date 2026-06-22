import { NextResponse } from "next/server";

import { fetchBacteriaReport } from "@/lib/usgs";

export const revalidate = 3600;

export async function GET() {
  try {
    const report = await fetchBacteriaReport();
    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
