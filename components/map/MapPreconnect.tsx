"use client";

import { useEffect } from "react";

/** Add tile CDN hints only when the map is about to load. */
export function MapPreconnect() {
  useEffect(() => {
    for (const href of [
      "https://basemaps.cartocdn.com",
      "https://a.basemaps.cartocdn.com",
      "https://b.basemaps.cartocdn.com",
      "https://c.basemaps.cartocdn.com",
    ]) {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) continue;

      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  }, []);

  return null;
}
