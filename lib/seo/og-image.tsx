import { ImageResponse } from "next/og";

import type { Brand } from "@/lib/brand";
import { brands } from "@/lib/brand";

export const ogImageSize = { width: 1200, height: 630 };

export function generateOgImage(brand: Brand = brands.isthehoochpoopy) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: brand.ogSubtitle ? 68 : 72,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textAlign: "center",
            padding: "0 80px",
            lineHeight: 1.1,
          }}
        >
          {brand.ogTitle}
        </div>
        {brand.ogSubtitle ? (
          <div
            style={{
              color: "#999",
              fontSize: 34,
              fontWeight: 500,
              letterSpacing: "0.01em",
              textAlign: "center",
              padding: "0 80px",
              marginTop: 28,
              lineHeight: 1.3,
            }}
          >
            {brand.ogSubtitle}
          </div>
        ) : null}
      </div>
    ),
    ogImageSize,
  );
}
