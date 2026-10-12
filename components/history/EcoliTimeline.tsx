"use client";

import { useEffect, useState, type KeyboardEvent } from "react";

import { UsgsBacterialertLink } from "@/components/shared/UsgsBacterialertLink";
import { getBacteriaHistory, seedBacteriaHistory } from "@/lib/bacteria/history-cache";
import {
  E_COLI_THRESHOLD,
  HISTORY_PERIODS,
  STATION_CHART_COLORS,
  STATION_CHART_COLORS_LIGHT,
  type BacteriaHistoryReport,
  type HistoryPeriod,
} from "@/lib/bacteria/usgs";
import { useTheme } from "@/lib/use-theme";

import { colorForStation } from "./chart-utils";
import { StationHistoryCards } from "./StationHistoryCards";
import { TimelineChart } from "./TimelineChart";

export function EcoliTimeline({
  initialHistory = null,
}: {
  initialHistory?: BacteriaHistoryReport | null;
}) {
  const theme = useTheme();
  const [period, setPeriod] = useState<HistoryPeriod>(initialHistory?.period ?? "P7D");
  const [history, setHistory] = useState<BacteriaHistoryReport | null>(initialHistory);
  const [loading, setLoading] = useState(!initialHistory);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialHistory) {
      seedBacteriaHistory(initialHistory);
    }
  }, [initialHistory]);

  useEffect(() => {
    let cancelled = false;

    if (history?.period === period) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getBacteriaHistory(period)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Couldn't load history");
          setHistory(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, history?.period]);

  const hasData = history?.stations.some((station) => station.points.length > 0) ?? false;
  const displayStations = history ? history.stations.slice().reverse() : [];
  const chartColors = theme === "light" ? STATION_CHART_COLORS_LIGHT : STATION_CHART_COLORS;

  const selectPeriod = (value: HistoryPeriod) => {
    setPeriod(value);
  };

  const handleRangeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = HISTORY_PERIODS.findIndex((item) => item.value === period);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % HISTORY_PERIODS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + HISTORY_PERIODS.length) % HISTORY_PERIODS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = HISTORY_PERIODS.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = HISTORY_PERIODS[nextIndex];
    if (!next) return;
    selectPeriod(next.value);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons[nextIndex]?.focus();
  };

  return (
    <section className="timeline-section" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="visually-hidden">
        E. coli timeline
      </h2>

      <div
        className="timeline-controls"
        role="radiogroup"
        aria-label="History range"
        onKeyDown={handleRangeKeyDown}
      >
        {HISTORY_PERIODS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={period === item.value}
            tabIndex={period === item.value ? 0 : -1}
            className={`timeline-range-btn${period === item.value ? " is-active" : ""}`}
            onClick={() => selectPeriod(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="timeline-panel" aria-busy={loading || undefined}>
        {loading && (
          <>
            <div className="timeline-skeleton" aria-hidden="true" />
            <p className="visually-hidden" role="status">
              Loading history
            </p>
          </>
        )}

        {!loading && error && (
          <p className="timeline-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && history && hasData && (
          <>
            <div className="timeline-desktop">
              <TimelineChart stations={displayStations} period={period} />
              <ul className="timeline-legend">
                {displayStations.map((station) => (
                  <li key={station.id}>
                    <span
                      className="timeline-legend-swatch"
                      style={{
                        background: colorForStation(station.id, chartColors),
                      }}
                      aria-hidden="true"
                    />
                    {station.name}
                  </li>
                ))}
                <li>
                  <span className="timeline-legend-swatch timeline-legend-swatch-threshold" aria-hidden="true" />
                  EPA limit ({E_COLI_THRESHOLD})
                </li>
              </ul>
            </div>
            <div className="timeline-mobile">
              <StationHistoryCards stations={displayStations} period={period} />
            </div>
          </>
        )}

        {!loading && !error && history && !hasData && (
          <p className="timeline-error" role="status">
            No historical readings for this range.
          </p>
        )}
      </div>

      <p className="section-note">
        Estimated E. coli (cfu/100 mL) from <UsgsBacterialertLink />.
      </p>
    </section>
  );
}
