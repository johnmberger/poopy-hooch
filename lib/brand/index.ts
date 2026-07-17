export type BrandId = "isthehoochpoopy" | "poopthehooch";

export interface Brand {
  id: BrandId;
  siteName: string;
  siteTitle: string;
  titleHelper: string;
  /** Optional question shown above the verdict (used when the title isn't a question). */
  verdictPrompt: string | null;
  siteUrl: string;
  siteDescription: string;
  ogTitle: string;
  ogSubtitle: string | null;
}

export const DEFAULT_BRAND_ID: BrandId = "isthehoochpoopy";

export const brands: Record<BrandId, Brand> = {
  isthehoochpoopy: {
    id: "isthehoochpoopy",
    siteName: "Is the Hooch poopy?",
    siteTitle: "Is the Hooch poopy? | Chattahoochee River Tubing & Safety Check",
    titleHelper: "Chattahoochee River water quality today · Atlanta, Georgia",
    verdictPrompt: null,
    siteUrl: "https://isthehoochpoopy.com",
    siteDescription:
      "Chattahoochee River water quality today — is it safe to shoot the Hooch? Check live E. coli bacteria levels before tubing or floating in Atlanta. USGS BacteriALERT readings at Medlock Bridge, Powers Ferry, and Paces Ferry.",
    ogTitle: "Is the Hooch poopy?",
    ogSubtitle: null,
  },
  poopthehooch: {
    id: "poopthehooch",
    siteName: "Poop the Hooch!",
    siteTitle: "Poop the Hooch! | Is the Chattahoochee poopy?",
    titleHelper: "Chattahoochee River water quality today · Atlanta, Georgia",
    verdictPrompt: "Is the Chattahoochee poopy?",
    siteUrl: "https://poopthehooch.com",
    siteDescription:
      "Is the Chattahoochee poopy? Check live E. coli bacteria levels before tubing or floating in Atlanta. USGS BacteriALERT readings at Medlock Bridge, Powers Ferry, and Paces Ferry.",
    ogTitle: "Poop the Hooch!",
    ogSubtitle: "Is the Chattahoochee poopy?",
  },
};

export const BRAND_IDS = Object.keys(brands) as BrandId[];

export function isBrandId(value: string): value is BrandId {
  return value in brands;
}

export function getBrand(id: string | null | undefined): Brand {
  if (id && isBrandId(id)) return brands[id];
  return brands[DEFAULT_BRAND_ID];
}

export function normalizeHost(host: string): string {
  return host.toLowerCase().split(":")[0]!.replace(/^www\./, "");
}

export function getBrandFromHost(host: string | null | undefined): Brand {
  const forced = process.env.FORCE_BRAND;
  if (forced && isBrandId(forced)) return brands[forced];

  const normalized = normalizeHost(host ?? "");
  if (normalized === "poopthehooch.com") return brands.poopthehooch;
  return brands.isthehoochpoopy;
}

export function brandStaticParams() {
  return BRAND_IDS.map((brand) => ({ brand }));
}
