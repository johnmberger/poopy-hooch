import { describe, expect, it } from "vitest";

import { faqItems, getStructuredData, siteDescription, siteUrl } from "@/lib/seo";

describe("getStructuredData", () => {
  it("includes website, webpage, app, and FAQ schema nodes", () => {
    const data = getStructuredData();
    const types = data["@graph"].map((node) => node["@type"]);

    expect(types).toEqual(expect.arrayContaining(["WebSite", "WebPage", "WebApplication", "FAQPage"]));
  });

  it("uses the public site URL in canonical schema ids", () => {
    const data = getStructuredData();
    const website = data["@graph"].find((node) => node["@type"] === "WebSite");

    expect(website?.["@id"]).toBe(`${siteUrl}/#website`);
    expect(website?.description).toBe(siteDescription);
  });

  it("mirrors FAQ items into structured data", () => {
    const data = getStructuredData();
    const faq = data["@graph"].find((node) => node["@type"] === "FAQPage");
    const questions = faq?.mainEntity?.map((item) => item.name) ?? [];

    expect(questions).toHaveLength(faqItems.length);
    expect(questions).toContain("What is the Chattahoochee River water quality today?");
  });
});
