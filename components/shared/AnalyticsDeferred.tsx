"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false },
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

export function AnalyticsDeferred() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(enable, 1500);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
