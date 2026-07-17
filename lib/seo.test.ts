import { describe, expect, it } from "vitest";

import { brands } from "@/lib/brand";
import { faqItems, getStructuredData } from "@/lib/seo";

describe("getStructuredData", () => {
  it("includes website, webpage, app, and FAQ schema nodes", () => {
    const data = getStructuredData();
    const types = data["@graph"].map((node) => node["@type"]);

    expect(types).toEqual(expect.arrayContaining(["WebSite", "WebPage", "WebApplication", "FAQPage"]));
  });

  it("uses the public site URL in canonical schema ids", () => {
    const brand = brands.isthehoochpoopy;
    const data = getStructuredData(brand);
    const website = data["@graph"].find((node) => node["@type"] === "WebSite");

    expect(website?.["@id"]).toBe(`${brand.siteUrl}/#website`);
    expect(website?.description).toBe(brand.siteDescription);
  });

  it("uses poopthehooch branding when that brand is passed in", () => {
    const brand = brands.poopthehooch;
    const data = getStructuredData(brand);
    const website = data["@graph"].find((node) => node["@type"] === "WebSite");

    expect(website?.name).toBe("Poop the Hooch");
    expect(website?.["@id"]).toBe("https://poopthehooch.com/#website");
  });

  it("mirrors FAQ items into structured data", () => {
    const data = getStructuredData();
    const faq = data["@graph"].find((node) => node["@type"] === "FAQPage");
    const questions = faq?.mainEntity?.map((item) => item.name) ?? [];

    expect(questions).toHaveLength(faqItems.length);
    expect(questions).toContain("What is the Chattahoochee River water quality today?");
  });
});
