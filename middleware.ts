import { NextResponse, type NextRequest } from "next/server";

import { getBrandFromHost, isBrandId } from "@/lib/brand";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const brand = getBrandFromHost(host);
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // Already on a brand path — serve as-is (used by generateStaticParams URLs / OG images).
  if (first && isBrandId(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${brand.id}` : `/${brand.id}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
