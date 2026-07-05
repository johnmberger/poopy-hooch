import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getBacteriaHistory,
  seedBacteriaHistory,
} from "@/lib/bacteria-history-cache";
import type { BacteriaHistoryReport } from "@/lib/usgs";

const mockHistory = (period: BacteriaHistoryReport["period"]): BacteriaHistoryReport => ({
  period,
  stations: [
    { id: "02335000", name: "Medlock Bridge", points: [{ dateTime: "2026-07-04T22:00:00-04:00", eColi: 100 }] },
    { id: "02335880", name: "Powers Ferry", points: [] },
    { id: "02336000", name: "Paces Ferry", points: [] },
  ],
});

describe("getBacteriaHistory", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const period = new URL(url, "http://localhost").searchParams.get("period") ?? "P7D";
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHistory(period as BacteriaHistoryReport["period"])),
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects outside the browser", async () => {
    vi.unstubAllGlobals();
    await expect(getBacteriaHistory("P7D")).rejects.toThrow(/browser/i);
  });

  it("dedupes requests for the same period", async () => {
    const first = getBacteriaHistory("P7D");
    const second = getBacteriaHistory("P7D");

    expect(first).toBe(second);
    await first;
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/bacteria/history?period=P7D");
  });

  it("keeps separate cache entries per period", async () => {
    const week = getBacteriaHistory("P7D");
    const month = getBacteriaHistory("P30D");

    expect(week).not.toBe(month);
    await Promise.all([week, month]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe("seedBacteriaHistory", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reuses seeded data without fetching", async () => {
    const seeded = mockHistory("P7D");
    seedBacteriaHistory(seeded);

    const report = await getBacteriaHistory("P7D");

    expect(report).toEqual(seeded);
    expect(fetch).not.toHaveBeenCalled();
  });
});
