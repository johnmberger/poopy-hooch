import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageAlt = "Is the Hooch poopy?";

export function generateOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textAlign: "center",
            padding: "0 80px",
            lineHeight: 1.1,
          }}
        >
          Is the Hooch poopy?
        </div>
      </div>
    ),
    ogImageSize,
  );
}
