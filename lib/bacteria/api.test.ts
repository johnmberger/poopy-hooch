import { beforeEach, describe, expect, it, vi } from "vitest";

import { JSON_CACHE_CONTROL } from "@/lib/bacteria/cache-config";

const mockGetReport = vi.fn();
const mockGetHistory = vi.fn();

vi.mock("@/lib/bacteria/server", () => ({
  getServerBacteriaReport: (...args: Parameters<typeof mockGetReport>) => mockGetReport(...args),
  getServerBacteriaHistory: (...args: Parameters<typeof mockGetHistory>) => mockGetHistory(...args),
}));

import { GET as getBacteria } from "@/app/api/bacteria/route";
import { GET as getHistory } from "@/app/api/bacteria/history/route";

describe("GET /api/bacteria", () => {
  beforeEach(() => {
    mockGetReport.mockReset();
  });

  it("returns cached JSON with cache-control headers", async () => {
    const report = { updatedAt: "2026-07-04T22:00:00-04:00", stations: [], summary: {} };
    mockGetReport.mockResolvedValue(report);

    const response = await getBacteria();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(JSON_CACHE_CONTROL);
    await expect(response.json()).resolves.toEqual(report);
  });

  it("returns 502 when the server cache has no data", async () => {
    mockGetReport.mockResolvedValue(null);

    const response = await getBacteria();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "Failed to fetch bacteria data" });
  });
});

describe("GET /api/bacteria/history", () => {
  beforeEach(() => {
    mockGetHistory.mockReset();
  });

  it("returns cached JSON with cache-control headers", async () => {
    const history = { period: "P7D", stations: [] };
    mockGetHistory.mockResolvedValue(history);

    const response = await getHistory(new Request("http://localhost/api/bacteria/history?period=P7D"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(JSON_CACHE_CONTROL);
    expect(mockGetHistory).toHaveBeenCalledWith("P7D");
    await expect(response.json()).resolves.toEqual(history);
  });

  it("rejects invalid periods without hitting the cache", async () => {
    const response = await getHistory(new Request("http://localhost/api/bacteria/history?period=P1Y"));

    expect(response.status).toBe(400);
    expect(mockGetHistory).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: "Invalid period" });
  });

  it("returns 502 when the server cache has no data", async () => {
    mockGetHistory.mockResolvedValue(null);

    const response = await getHistory(new Request("http://localhost/api/bacteria/history?period=P30D"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "Failed to fetch history" });
  });
});
