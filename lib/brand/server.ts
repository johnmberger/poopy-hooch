import { brands, getBrand, type Brand, type BrandId } from "@/lib/brand";

/** Resolve brand from a path segment — no headers(), safe for ISR. */
export function getBrandFromParams(brandId: string): Brand {
  return getBrand(brandId);
}

export function assertBrandId(brandId: string): BrandId {
  if (brandId in brands) return brandId as BrandId;
  return brands.isthehoochpoopy.id;
}
