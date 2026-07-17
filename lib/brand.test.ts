import { describe, expect, it } from "vitest";

import { brands, getBrandFromHost, normalizeHost } from "@/lib/brand";

describe("normalizeHost", () => {
  it("strips www, ports, and lowercases", () => {
    expect(normalizeHost("WWW.PoopTheHooch.com:443")).toBe("poopthehooch.com");
  });
});

describe("getBrandFromHost", () => {
  it("returns the poopthehooch brand for that domain", () => {
    expect(getBrandFromHost("poopthehooch.com")).toEqual(brands.poopthehooch);
    expect(getBrandFromHost("www.poopthehooch.com")).toEqual(brands.poopthehooch);
    expect(brands.poopthehooch.verdictPrompt).toBe("Is the Chattahoochee poopy?");
  });

  it("defaults to isthehoochpoopy for the primary domain and unknown hosts", () => {
    expect(getBrandFromHost("isthehoochpoopy.com")).toEqual(brands.isthehoochpoopy);
    expect(getBrandFromHost("localhost:3000")).toEqual(brands.isthehoochpoopy);
    expect(getBrandFromHost(null)).toEqual(brands.isthehoochpoopy);
    expect(brands.isthehoochpoopy.verdictPrompt).toBeNull();
  });
});
