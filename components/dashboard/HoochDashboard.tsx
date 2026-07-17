"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { HistorySparkline } from "@/components/dashboard/HistorySparkline";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { LearnMore } from "@/components/content/LearnMore";
import { UsgsBacterialertLink } from "@/components/shared/UsgsBacterialertLink";
import { RiverMap } from "@/components/map/RiverMap";
import { getBacteriaReport } from "@/lib/bacteria/cache";
import { E_COLI_THRESHOLD, type BacteriaHistoryReport, type BacteriaReport } from "@/lib/bacteria/usgs";
import { HoochSkeleton } from "./HoochSkeleton";

const FlyingPoop = dynamic(
  () => import("@/components/shared/FlyingPoop").then((mod) => ({ default: mod.FlyingPoop })),
  { ssr: false },
);

function formatObservedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function verdictClass(report: BacteriaReport): "safe" | "unsafe" | "mixed" {
  if (report.summary.overallSafe) return "safe";
  if (report.summary.safeCount === 0) return "unsafe";
  return "mixed";
}

export function HoochDashboard({
  initialReport,
  historyPreview = null,
}: {
  initialReport: BacteriaReport | null;
  historyPreview?: BacteriaHistoryReport | null;
}) {
  const [report, setReport] = useState<BacteriaReport | null>(initialReport);
  const [error, setError] = useState<string | null>(null);
  const [forcePoop, setForcePoop] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setForcePoop(new URLSearchParams(window.location.search).get("poop") === "1");
    }
  }, []);

  useEffect(() => {
    if (initialReport) return;

    let cancelled = false;

    getBacteriaReport()
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "couldn't check the poop levels");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialReport]);

  if (error) {
    return (
      <div className="error-box">
        <p>welp. {error}</p>
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
          try again or hit up <UsgsBacterialertLink />.
        </p>
      </div>
    );
  }

  if (!report) {
    return <HoochSkeleton />;
  }

  return (
    <>
      <section className={`verdict ${verdictClass(report)}`} aria-live="polite">
        <h2>{report.summary.headline}</h2>
        <p className="verdict-message">{report.summary.message}</p>
        <p className="verdict-updated">
          Updated {formatObservedAt(report.updatedAt)}. Based on E. coli readings at{" "}
          {report.stations.length} USGS stations on the Chattahoochee.
        </p>
      </section>

      <ErrorBoundary
        fallback={
          <figure className="river-map">
            <figcaption className="stations-heading">River map</figcaption>
            <div className="map-error" role="status">
              <p>Map failed to load.</p>
              <p>Station readings below still work.</p>
            </div>
          </figure>
        }
      >
        <RiverMap stations={report.stations} />
      </ErrorBoundary>

      <p className="stations-heading">Monitoring stations</p>
      <p className="section-note">
        USGS estimates, not gospel.{" "}
        <a href="https://ga.water.usgs.gov/bacteria/" target="_blank" rel="noopener noreferrer">
          Source
        </a>
      </p>
      <ul className="station-list">
        {report.stations.map((station) => (
          <li key={station.id} className="station">
            <div className="station-left">
              <span className="station-name">{station.name}</span>
              <span className="station-section">{station.section}</span>
              <span className="station-reading">
                {Math.round(station.eColi)} cfu/100 mL ·{" "}
                {station.risk === "low" ? "below" : "above"} EPA limit ({E_COLI_THRESHOLD})
              </span>
            </div>
            <span className={`station-badge ${station.risk}`}>
              {station.risk === "low" ? "clean" : "poopy"}
            </span>
          </li>
        ))}
        <li className="station-list-more">
          <Link href="/history" className="station-list-link">
            <span className="station-list-link-text">
              <span className="station-name">Recent levels</span>
              <span className="station-section">7 days, 30 days, and 4 months of E. coli trends</span>
            </span>
            <span className="station-list-link-aside">
              {historyPreview && historyPreview.stations.some((station) => station.points.length > 0) && (
                <HistorySparkline stations={historyPreview.stations} />
              )}
              <span className="station-list-link-icon" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
        </li>
        <li className="station-list-more">
          <LearnMore />
        </li>
      </ul>

      {(!report.summary.overallSafe || forcePoop) && <FlyingPoop active />}
    </>
  );
}
