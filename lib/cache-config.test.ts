import { describe, expect, it } from "vitest";

import { DATA_REVALIDATE_SECONDS, JSON_CACHE_CONTROL } from "@/lib/cache-config";

describe("cache-config", () => {
  it("uses a one-hour TTL for JSON responses", () => {
    expect(DATA_REVALIDATE_SECONDS).toBe(3600);
    expect(JSON_CACHE_CONTROL).toContain("max-age=3600");
    expect(JSON_CACHE_CONTROL).toContain("s-maxage=3600");
    expect(JSON_CACHE_CONTROL).toContain("stale-while-revalidate=86400");
  });
});
