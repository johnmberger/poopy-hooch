import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

const mockFetchReport = vi.fn();
const mockFetchHistory = vi.fn();

vi.mock("@/lib/bacteria/usgs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/bacteria/usgs")>();
  return {
    ...actual,
    fetchBacteriaReport: (...args: Parameters<typeof mockFetchReport>) => mockFetchReport(...args),
    fetchBacteriaHistory: (...args: Parameters<typeof mockFetchHistory>) => mockFetchHistory(...args),
  };
});

import { getServerBacteriaHistory, getServerBacteriaHistoryPreview, getServerBacteriaReport } from "@/lib/bacteria/server";
import { MAX_HISTORY_SPARKLINE_POINTS } from "@/lib/bacteria/usgs";

describe("getServerBacteriaReport", () => {
  beforeEach(() => {
    mockFetchReport.mockReset();
    mockFetchHistory.mockReset();
  });

  it("returns report data from the cached fetcher", async () => {
    const report = {
      updatedAt: "2026-07-04T22:00:00-04:00",
      stations: [],
      summary: {
        headline: "Not poopy at all",
        message: "You're good to go — the Hooch is holding it in.",
        overallSafe: true,
        safeCount: 3,
        totalCount: 3,
      },
    };
    mockFetchReport.mockResolvedValue(report);

    await expect(getServerBacteriaReport()).resolves.toEqual(report);
  });

  it("returns null when the fetcher fails", async () => {
    mockFetchReport.mockRejectedValue(new Error("USGS down"));

    await expect(getServerBacteriaReport()).resolves.toBeNull();
  });
});

describe("getServerBacteriaHistory", () => {
  beforeEach(() => {
    mockFetchReport.mockReset();
    mockFetchHistory.mockReset();
  });

  it("returns history for the requested period", async () => {
    const history = {
      period: "P30D" as const,
      stations: [{ id: "02335000", name: "Medlock Bridge", points: [] }],
    };
    mockFetchHistory.mockResolvedValue(history);

    await expect(getServerBacteriaHistory("P30D")).resolves.toEqual(history);
    expect(mockFetchHistory).toHaveBeenCalledWith("P30D");
  });

  it("returns null when the fetcher fails", async () => {
    mockFetchHistory.mockRejectedValue(new Error("USGS down"));

    await expect(getServerBacteriaHistory("P7D")).resolves.toBeNull();
  });
});

describe("getServerBacteriaHistoryPreview", () => {
  beforeEach(() => {
    mockFetchReport.mockReset();
    mockFetchHistory.mockReset();
  });

  it("downsamples history for the homepage sparkline", async () => {
    mockFetchHistory.mockResolvedValue({
      period: "P7D",
      stations: [
        {
          id: "02335000",
          name: "Medlock Bridge",
          points: Array.from({ length: 80 }, (_, index) => ({
            dateTime: `2026-07-01T${String(index % 24).padStart(2, "0")}:00:00-04:00`,
            eColi: index,
          })),
        },
      ],
    });

    const preview = await getServerBacteriaHistoryPreview("P7D");

    expect(preview?.stations[0]!.points.length).toBeLessThanOrEqual(MAX_HISTORY_SPARKLINE_POINTS);
  });

  it("returns null when history is unavailable", async () => {
    mockFetchHistory.mockRejectedValue(new Error("USGS down"));

    await expect(getServerBacteriaHistoryPreview("P7D")).resolves.toBeNull();
  });
});
