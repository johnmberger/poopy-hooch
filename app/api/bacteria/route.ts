import { NextResponse } from "next/server";

import { getServerBacteriaReport } from "@/lib/bacteria-server";
import { JSON_CACHE_CONTROL } from "@/lib/cache-config";

export const revalidate = 3600;

export async function GET() {
  try {
    const report = await getServerBacteriaReport();
    if (!report) {
      return NextResponse.json({ error: "Failed to fetch bacteria data" }, { status: 502 });
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
