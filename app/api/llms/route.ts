import { getBrandFromHost } from "@/lib/brand";
import { E_COLI_THRESHOLD, USGS_BACTERIA_URL } from "@/lib/bacteria/usgs";

export const dynamic = "force-dynamic";

function buildLlmsTxt(host: string | null): string {
  const brand = getBrandFromHost(host);
  const base = brand.siteUrl.replace(/\/$/, "");

  return `# ${brand.siteName}
> ${brand.siteDescription}

This site checks whether the Chattahoochee River ("the Hooch") in Atlanta is safe to tube or float today. It uses live estimated E. coli readings from USGS BacteriALERT stations. Values above ${E_COLI_THRESHOLD} cfu/100 mL are treated as poopy under EPA recreational water guidance.

## Pages
- [Today's check](${base}/): Current verdict, river map, and monitoring station readings
- [Recent levels](${base}/history): Estimated E. coli trends for 7 days, 30 days, and 4 months

## Data
- [USGS BacteriALERT](${USGS_BACTERIA_URL}): Official Georgia USGS bacteria estimates used by this site

## Optional
- [Is the Hooch poopy?](https://isthehoochpoopy.com/): Primary brand of this tool
- [Poop the Hooch](https://poopthehooch.com/): Alternate brand of the same tool
`;
}

export async function GET(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const body = buildLlmsTxt(host);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
