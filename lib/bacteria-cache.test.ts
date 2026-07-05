import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getBacteriaReport } from "@/lib/bacteria-cache";
import type { BacteriaReport } from "@/lib/usgs";

const mockReport: BacteriaReport = {
  updatedAt: "2026-07-04T22:00:00-04:00",
  stations: [],
  summary: {
    headline: "Not poopy at all",
    message: "You're good to go!",
    overallSafe: true,
    safeCount: 3,
    totalCount: 3,
  },
};

describe("getBacteriaReport", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReport),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects outside the browser", async () => {
    vi.unstubAllGlobals();
    await expect(getBacteriaReport()).rejects.toThrow(/browser/i);
  });

  it("reuses the same in-flight promise", async () => {
    const first = getBacteriaReport();
    const second = getBacteriaReport();

    expect(first).toBe(second);
    await first;
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/bacteria");
  });

  it("surfaces API errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ error: "upstream failed" }),
    } as Response);

    await expect(getBacteriaReport()).rejects.toThrow("upstream failed");
  });
});
