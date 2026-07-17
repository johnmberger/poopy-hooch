import { getBrandFromParams } from "@/lib/brand/server";
import { generateOgImage, ogImageSize } from "@/lib/seo/og-image";

export const size = ogImageSize;
export const contentType = "image/png";
export const alt = "Chattahoochee River bacteria check";
export const revalidate = 3600;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  return generateOgImage(getBrandFromParams(brandId));
}
