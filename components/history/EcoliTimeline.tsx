"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

import { getBacteriaHistory, seedBacteriaHistory } from "@/lib/bacteria/history-cache";
import { UsgsBacterialertLink } from "@/components/shared/UsgsBacterialertLink";
import {
  E_COLI_THRESHOLD,
  HISTORY_PERIODS,
  riskFromEcoli,
  STATION_CHART_COLORS,
  STATION_CHART_COLORS_LIGHT,
  type BacteriaHistoryReport,
  type HistoryPeriod,
  type HistoryPoint,
  type StationHistory,
} from "@/lib/bacteria/usgs";
import { useTheme } from "@/lib/use-theme";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const PADDING = { top: 14, right: 10, bottom: 30, left: 42 };

function xAxisTickCount(period: HistoryPeriod, narrow = false): number {
  if (narrow) {
    switch (period) {
      case "P7D":
        return 4;
      case "P30D":
        return 4;
      case "P120D":
        return 4;
    }
  }

  switch (period) {
    case "P7D":
      return 5;
    case "P30D":
      return 6;
    case "P120D":
      return 5;
  }
}

function formatAxisTime(time: number, period: HistoryPeriod, narrow = false): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  };

  if (period === "P7D" && !narrow) {
    options.weekday = "short";
  }

  if (period === "P120D") {
    delete options.day;
  }

  return new Intl.DateTimeFormat("en-US", options).format(new Date(time));
}

function buildXAxisTicks(minTime: number, maxTime: number, count: number): number[] {
  if (count <= 1 || maxTime <= minTime) return [minTime];

  return Array.from({ length: count }, (_, index) => minTime + ((maxTime - minTime) * index) / (count - 1));
}

function formatHoverDate(iso: string, period: HistoryPeriod): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  };

  if (period === "P7D") {
    options.weekday = "short";
    options.hour = "numeric";
    options.minute = "2-digit";
  }

  return new Intl.DateTimeFormat("en-US", options).format(new Date(iso));
}

function findNearestPoint(points: HistoryPoint[], targetTime: number): HistoryPoint | null {
  if (points.length === 0) return null;

  let best = points[0]!;
  let bestDistance = Math.abs(new Date(best.dateTime).getTime() - targetTime);

  for (const point of points) {
    const distance = Math.abs(new Date(point.dateTime).getTime() - targetTime);
    if (distance < bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }

  return best;
}

interface HoverReading {
  stationId: string;
  name: string;
  color: string;
  eColi: number;
  risk: "low" | "high";
  x: number;
  y: number;
}

interface HoverState {
  x: number;
  dateTime: string;
  readings: HoverReading[];
}

function useNarrowChart(): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 480px)");
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return narrow;
}

function buildLinePath(
  points: HistoryPoint[],
  xScale: (iso: string) => number,
  yScale: (value: number) => number,
): string {
  if (points.length === 0) return "";

  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xScale(point.dateTime).toFixed(2)} ${yScale(point.eColi).toFixed(2)}`;
    })
    .join(" ");
}

function TimelineChart({
  stations,
  period,
}: {
  stations: StationHistory[];
  period: HistoryPeriod;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrow = useNarrowChart();
  const theme = useTheme();
  const chartColors = theme === "light" ? STATION_CHART_COLORS_LIGHT : STATION_CHART_COLORS;
  const [hover, setHover] = useState<HoverState | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    setHover(null);
    setFocusIndex(0);
  }, [stations, period]);

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const plotBottom = PADDING.top + plotHeight;

  const { minTime, maxTime, yMax } = useMemo(() => {
    const allPoints = stations.flatMap((station) => station.points);
    const times = allPoints.map((point) => new Date(point.dateTime).getTime());
    const values = allPoints.map((point) => point.eColi);
    const maxValue = values.length ? Math.max(...values) : E_COLI_THRESHOLD;

    return {
      minTime: times.length ? Math.min(...times) : Date.now(),
      maxTime: times.length ? Math.max(...times) : Date.now(),
      yMax: Math.max(maxValue * 1.15, E_COLI_THRESHOLD * 1.5, 300),
    };
  }, [stations]);

  const scrubTimes = useMemo(() => {
    const unique = new Set<number>();
    for (const station of stations) {
      for (const point of station.points) {
        unique.add(new Date(point.dateTime).getTime());
      }
    }
    const sorted = Array.from(unique).sort((a, b) => a - b);
    if (sorted.length <= 48) return sorted;
    const step = (sorted.length - 1) / 47;
    return Array.from({ length: 48 }, (_, index) => sorted[Math.round(index * step)]!);
  }, [stations]);

  const stationSummaries = useMemo(
    () =>
      stations.map((station) => {
        const values = station.points.map((point) => point.eColi);
        const latest = station.points.at(-1);
        return {
          id: station.id,
          name: station.name,
          latest: latest ? Math.round(latest.eColi) : null,
          highest: values.length ? Math.round(Math.max(...values)) : null,
          lowest: values.length ? Math.round(Math.min(...values)) : null,
        };
      }),
    [stations],
  );

  const xScale = (iso: string) => {
    const time = new Date(iso).getTime();
    const span = maxTime - minTime || 1;
    return PADDING.left + ((time - minTime) / span) * plotWidth;
  };

  const yScale = (value: number) =>
    PADDING.top + plotHeight - (value / yMax) * plotHeight;

  const timeFromX = (x: number) => {
    const plotX = x - PADDING.left;
    const span = maxTime - minTime || 1;
    return minTime + (plotX / plotWidth) * span;
  };

  const hoverFromTime = (targetTime: number, xHint?: number): HoverState | null => {
    const readings: HoverReading[] = [];
    let nearestDateTime: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const [index, station] of stations.entries()) {
      const point = findNearestPoint(station.points, targetTime);
      if (!point) continue;

      const distance = Math.abs(new Date(point.dateTime).getTime() - targetTime);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestDateTime = point.dateTime;
      }

      readings.push({
        stationId: station.id,
        name: station.name,
        color: chartColors[index % chartColors.length]!,
        eColi: point.eColi,
        risk: riskFromEcoli(point.eColi),
        x: xScale(point.dateTime),
        y: yScale(point.eColi),
      });
    }

    if (readings.length === 0 || !nearestDateTime) return null;

    const span = maxTime - minTime || 1;
    const x =
      xHint ??
      PADDING.left + ((new Date(nearestDateTime).getTime() - minTime) / span) * plotWidth;

    return { x, dateTime: nearestDateTime, readings };
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;

    if (x < PADDING.left || x > CHART_WIDTH - PADDING.right) {
      setHover(null);
      return;
    }

    setHover(hoverFromTime(timeFromX(x), x));
  };

  const handleKeyDown = (event: KeyboardEvent<SVGRectElement>) => {
    if (scrubTimes.length === 0) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = Math.min(Math.max(focusIndex + delta, 0), scrubTimes.length - 1);
      setFocusIndex(nextIndex);
      setHover(hoverFromTime(scrubTimes[nextIndex]!));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setFocusIndex(0);
      setHover(hoverFromTime(scrubTimes[0]!));
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const last = scrubTimes.length - 1;
      setFocusIndex(last);
      setHover(hoverFromTime(scrubTimes[last]!));
    }
  };

  const thresholdY = yScale(E_COLI_THRESHOLD);
  const xAxisTicks = useMemo(
    () => buildXAxisTicks(minTime, maxTime, xAxisTickCount(period, narrow)),
    [minTime, maxTime, period, narrow],
  );
  const tooltipLeft = hover && !narrow ? Math.min(Math.max((hover.x / CHART_WIDTH) * 100, 8), 92) : 50;
  const periodLabel = HISTORY_PERIODS.find((item) => item.value === period)?.label ?? period;
  const liveText = hover
    ? `${formatHoverDate(hover.dateTime, period)}. ${hover.readings
        .map((reading) => `${reading.name}: ${Math.round(reading.eColi)} cfu per 100 mL`)
        .join(". ")}`
    : "";

  return (
    <div className={`timeline-chart-wrap${narrow ? " is-narrow" : ""}`}>
      {hover && (
        <div
          className="timeline-tooltip"
          style={narrow ? undefined : { left: `${tooltipLeft}%` }}
          role="status"
          aria-live="polite"
        >
          <p className="timeline-tooltip-date">
            {formatHoverDate(hover.dateTime, period)}
            {narrow && <span className="timeline-tooltip-unit"> · cfu/100 mL</span>}
          </p>
          <ul className="timeline-tooltip-list">
            {hover.readings.map((reading) => (
              <li key={reading.stationId}>
                <span
                  className="timeline-tooltip-swatch"
                  style={{ background: reading.color }}
                  aria-hidden="true"
                />
                <span className="timeline-tooltip-name">{reading.name}</span>
                <span className={`timeline-tooltip-value ${reading.risk}`}>
                  {Math.round(reading.eColi)}
                  {!narrow && " cfu/100 mL"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <svg
        ref={svgRef}
        className="timeline-chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="group"
        aria-label={`Estimated E. coli chart for the past ${periodLabel}`}
      >
        {[0, E_COLI_THRESHOLD, yMax].map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              className="timeline-grid-line"
            />
            <text x={PADDING.left - 8} y={yScale(tick) + 4} className="timeline-axis-label" textAnchor="end">
              {Math.round(tick)}
            </text>
          </g>
        ))}

        {stations.map((station, index) => (
          <path
            key={station.id}
            d={buildLinePath(station.points, xScale, yScale)}
            className="timeline-line"
            stroke={chartColors[index % chartColors.length]}
            fill="none"
          />
        ))}

        <line
          x1={PADDING.left}
          x2={CHART_WIDTH - PADDING.right}
          y1={thresholdY}
          y2={thresholdY}
          className="timeline-threshold-line"
        />

        {hover && (
          <>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PADDING.top}
              y2={plotBottom}
              className="timeline-crosshair"
            />
            {hover.readings.map((reading) => (
              <circle
                key={reading.stationId}
                cx={reading.x}
                cy={reading.y}
                r={4}
                className="timeline-hover-dot"
                fill={reading.color}
                stroke="#000"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}

        <rect
          className="timeline-overlay"
          x={PADDING.left}
          y={PADDING.top}
          width={plotWidth}
          height={plotHeight}
          tabIndex={0}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={Math.max(scrubTimes.length - 1, 0)}
          aria-valuenow={focusIndex}
          aria-valuetext={liveText || "No reading selected. Use left and right arrows."}
          aria-label="Inspect E. coli readings over time"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHover(null)}
          onFocus={() => {
            if (!hover && scrubTimes.length > 0) {
              setHover(hoverFromTime(scrubTimes[focusIndex]!));
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {xAxisTicks.map((time, index) => {
          const span = maxTime - minTime || 1;
          const x = PADDING.left + ((time - minTime) / span) * plotWidth;
          const anchor = index === 0 ? "start" : index === xAxisTicks.length - 1 ? "end" : "middle";

          return (
            <text
              key={time}
              x={x}
              y={CHART_HEIGHT - 8}
              className="timeline-axis-label"
              textAnchor={anchor}
            >
              {formatAxisTime(time, period, narrow)}
            </text>
          );
        })}
      </svg>

      <table className="visually-hidden">
        <caption>E. coli summary for the past {periodLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Station</th>
            <th scope="col">Latest</th>
            <th scope="col">Highest</th>
            <th scope="col">Lowest</th>
          </tr>
        </thead>
        <tbody>
          {stationSummaries.map((summary) => (
            <tr key={summary.id}>
              <th scope="row">{summary.name}</th>
              <td>{summary.latest ?? "—"}</td>
              <td>{summary.highest ?? "—"}</td>
              <td>{summary.lowest ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
      <p className="section-note">
        Estimated E. coli (cfu/100 mL) from <UsgsBacterialertLink />.
      </p>

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
            <TimelineChart stations={history.stations} period={period} />
            <ul className="timeline-legend">
              {history.stations.map((station, index) => (
                <li key={station.id}>
                  <span
                    className="timeline-legend-swatch"
                    style={{
                      background: chartColors[index % chartColors.length],
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
          </>
        )}

        {!loading && !error && history && !hasData && (
          <p className="timeline-error" role="status">
            No historical readings for this range.
          </p>
        )}
      </div>
    </section>
  );
}
