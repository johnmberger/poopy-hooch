"use client";

import { useEffect, useState } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RiverMap } from "@/components/RiverMap";
import { getBacteriaReport } from "@/lib/bacteria-cache";
import { E_COLI_THRESHOLD, type BacteriaReport } from "@/lib/usgs";
import { HoochSkeleton } from "./HoochSkeleton";

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

export function HoochDashboard({ initialReport }: { initialReport: BacteriaReport | null }) {
  const [report, setReport] = useState<BacteriaReport | null>(initialReport);
  const [error, setError] = useState<string | null>(null);

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
          try again or hit up{" "}
          <a href="https://ga.water.usgs.gov/bacteria/" target="_blank" rel="noopener noreferrer">
            USGS BacteriALERT
          </a>
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
        <p>{report.summary.message}</p>
      </section>

      <ErrorBoundary fallback={<p className="meta">Map failed to load. The spots below still have readings.</p>}>
        <RiverMap stations={report.stations} />
      </ErrorBoundary>

      <p className="stations-heading">The spots</p>
      <ul className="station-list">
        {report.stations.map((station) => (
          <li key={station.id} className="station">
            <div className="station-left">
              <span className="station-name">{station.name}</span>
              <span className="station-reading">{Math.round(station.eColi)} cfu/100 mL</span>
            </div>
            <span className={`station-badge ${station.risk}`}>
              {station.risk === "low" ? "clean" : "poopy"}
            </span>
          </li>
        ))}
      </ul>

      <footer className="meta">
        <p>
          Updated {formatObservedAt(report.updatedAt)}. USGS estimates, not gospel. Over{" "}
          {E_COLI_THRESHOLD} = poopy.{" "}
          <a href="https://ga.water.usgs.gov/bacteria/" target="_blank" rel="noopener noreferrer">
            Source
          </a>
        </p>
      </footer>
    </>
  );
}
