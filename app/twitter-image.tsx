import { getRequestBrand } from "@/lib/brand/server";
import { generateOgImage, ogImageSize } from "@/lib/seo/og-image";

export const size = ogImageSize;
export const contentType = "image/png";
export const alt = "Chattahoochee River bacteria check";

export default async function TwitterImage() {
  const brand = await getRequestBrand();
  return generateOgImage(brand);
}
