import { headers } from "next/headers";

import { brands, getBrandFromHost, type Brand, type BrandId } from "@/lib/brand";

export async function getRequestBrand(): Promise<Brand> {
  const forced = process.env.FORCE_BRAND as BrandId | undefined;
  if (forced && forced in brands) {
    return brands[forced];
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  return getBrandFromHost(host);
}
