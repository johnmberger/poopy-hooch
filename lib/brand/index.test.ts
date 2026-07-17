import { describe, expect, it } from "vitest";

import {
  brandStaticParams,
  brands,
  getBrand,
  getBrandFromHost,
  isBrandId,
  normalizeHost,
} from "@/lib/brand";

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

describe("getBrand / isBrandId", () => {
  it("resolves known brand ids and falls back for unknown ones", () => {
    expect(isBrandId("poopthehooch")).toBe(true);
    expect(isBrandId("nope")).toBe(false);
    expect(getBrand("poopthehooch")).toEqual(brands.poopthehooch);
    expect(getBrand("nope")).toEqual(brands.isthehoochpoopy);
  });

  it("lists both brands for static generation", () => {
    expect(brandStaticParams()).toEqual([
      { brand: "isthehoochpoopy" },
      { brand: "poopthehooch" },
    ]);
  });
});
