"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import {
  E_COLI_THRESHOLD,
  HISTORY_PERIODS,
  riskFromEcoli,
  STATION_CHART_COLORS,
  STATION_CHART_COLORS_LIGHT,
  type HistoryPeriod,
  type HistoryPoint,
  type StationHistory,
} from "@/lib/bacteria/usgs";
import { useTheme } from "@/lib/use-theme";

import {
  buildLinePath,
  colorForStation,
  findNearestPoint,
  formatAxisTime,
  formatCount,
  formatHoverDate,
  stationSummaries,
  visualYMax,
} from "./chart-utils";
import { HistorySummaryTable } from "./HistorySummaryTable";

const STATION_CHART_WIDTH = 320;
const STATION_CHART_HEIGHT = 140;
const STATION_PADDING = { top: 10, right: 4, bottom: 4, left: 4 };

function StationCard({
  station,
  color,
  period,
  minTime,
  maxTime,
}: {
  station: StationHistory;
  color: string;
  period: HistoryPeriod;
  minTime: number;
  maxTime: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<HistoryPoint | null>(() => station.points.at(-1) ?? null);

  useEffect(() => {
    setSelected(station.points.at(-1) ?? null);
  }, [station]);

  const plotWidth = STATION_CHART_WIDTH - STATION_PADDING.left - STATION_PADDING.right;
  const plotHeight = STATION_CHART_HEIGHT - STATION_PADDING.top - STATION_PADDING.bottom;
  const plotBottom = STATION_PADDING.top + plotHeight;

  const values = station.points.map((point) => point.eColi);
  const yMax = visualYMax(values);
  const actualMax = values.length ? Math.max(...values) : 0;
  const actualMin = values.length ? Math.min(...values) : 0;
  const latest = station.points.at(-1) ?? null;
  const showingLatest = !selected || selected === latest || selected?.dateTime === latest?.dateTime;
  const display = selected ?? latest;
  const risk = display ? riskFromEcoli(display.eColi) : "low";

  const xScale = (iso: string) => {
    const time = new Date(iso).getTime();
    const span = maxTime - minTime || 1;
    return STATION_PADDING.left + ((time - minTime) / span) * plotWidth;
  };

  const yScale = (value: number) =>
    STATION_PADDING.top + plotHeight - (Math.min(value, yMax) / yMax) * plotHeight;

  const linePath = buildLinePath(station.points, xScale, yScale);
  const firstPoint = station.points[0];
  const lastPoint = station.points.at(-1);
  const areaPath =
    linePath && firstPoint && lastPoint
      ? `${linePath} L ${xScale(lastPoint.dateTime).toFixed(2)} ${plotBottom} L ${xScale(firstPoint.dateTime).toFixed(2)} ${plotBottom} Z`
      : "";

  const thresholdY = yScale(E_COLI_THRESHOLD);
  const showThresholdLabel =
    Math.abs(yScale(E_COLI_THRESHOLD) - yScale(yMax)) > 16 &&
    Math.abs(yScale(E_COLI_THRESHOLD) - yScale(0)) > 16;

  const selectFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || station.points.length === 0) return;

    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * STATION_CHART_WIDTH;
    const clamped = Math.min(Math.max(x, STATION_PADDING.left), STATION_CHART_WIDTH - STATION_PADDING.right);
    const span = maxTime - minTime || 1;
    const targetTime = minTime + ((clamped - STATION_PADDING.left) / plotWidth) * span;
    const point = findNearestPoint(station.points, targetTime);
    if (point) setSelected(point);
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    selectFromClientX(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    if (
      event.pointerType === "mouse" ||
      event.currentTarget.hasPointerCapture(event.pointerId) ||
      event.buttons > 0
    ) {
      selectFromClientX(event.clientX);
    }
  };

  const yLabel = (value: number, label: string, edge?: "top" | "bottom") => (
    <span
      className={`station-card-y-label${edge ? ` is-${edge}` : ""}`}
      style={{ top: `${(yScale(value) / STATION_CHART_HEIGHT) * 100}%` }}
    >
      {label}
    </span>
  );

  const liveText = display
    ? `${station.name}, ${formatHoverDate(display.dateTime, period)}: ${formatCount(display.eColi)} cfu per 100 mL`
    : "";

  return (
    <article className="station-card">
      <header className="station-card-head">
        <div className="station-card-identity">
          <p className="station-card-name">
            <span className="station-card-swatch" style={{ background: color }} aria-hidden="true" />
            {station.name}
          </p>
          <p className="station-card-when">
            {display ? (showingLatest ? "Latest · " : "") + formatHoverDate(display.dateTime, period) : "No readings"}
          </p>
        </div>
        <p className={`station-card-reading ${risk}`}>
          <span className="station-card-number">{display ? formatCount(display.eColi) : "—"}</span>
          <span className="station-card-unit">cfu/100 mL</span>
        </p>
      </header>

      <p className="visually-hidden" aria-live="polite">
        {liveText}
      </p>

      {station.points.length > 0 && (
        <div className="station-plot">
          <div className="station-plot-y" aria-hidden="true">
            <span className="station-plot-y-sizer">EPA Limit</span>
            {showThresholdLabel && yLabel(E_COLI_THRESHOLD, "EPA Limit")}
            {yLabel(0, "0", "bottom")}
          </div>
          <svg
            ref={svgRef}
            className="station-card-chart"
            viewBox={`0 0 ${STATION_CHART_WIDTH} ${STATION_CHART_HEIGHT}`}
            aria-hidden="true"
          >
            <line
              x1={STATION_PADDING.left}
              x2={STATION_CHART_WIDTH - STATION_PADDING.right}
              y1={yScale(0)}
              y2={yScale(0)}
              className="timeline-grid-line"
            />
            <line
              x1={STATION_PADDING.left}
              x2={STATION_CHART_WIDTH - STATION_PADDING.right}
              y1={thresholdY}
              y2={thresholdY}
              className="timeline-threshold-line"
            />
            {areaPath && <path d={areaPath} className="station-card-area" fill={color} />}
            <path d={linePath} className="station-card-line" stroke={color} fill="none" />
            {display && (
              <>
                {!showingLatest && (
                  <line
                    x1={xScale(display.dateTime)}
                    x2={xScale(display.dateTime)}
                    y1={STATION_PADDING.top}
                    y2={plotBottom}
                    className="timeline-crosshair"
                  />
                )}
                <circle
                  cx={xScale(display.dateTime)}
                  cy={yScale(display.eColi)}
                  r={5}
                  className="timeline-hover-dot"
                  fill={color}
                  stroke="var(--bg)"
                  strokeWidth={2}
                />
              </>
            )}
            <rect
              className="timeline-overlay station-card-overlay"
              x={STATION_PADDING.left}
              y={STATION_PADDING.top}
              width={plotWidth}
              height={plotHeight}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
            />
          </svg>
          <div className="station-plot-x" aria-hidden="true">
            <span>{formatAxisTime(minTime, period, true)}</span>
            <span>{formatAxisTime(maxTime, period, true)}</span>
          </div>
        </div>
      )}

      <dl className="station-card-stats">
        <div>
          <dt>High</dt>
          <dd className={actualMax > E_COLI_THRESHOLD ? "high" : "low"}>{formatCount(actualMax)}</dd>
        </div>
        <div>
          <dt>Low</dt>
          <dd>{formatCount(actualMin)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function StationHistoryCards({
  stations,
  period,
}: {
  stations: StationHistory[];
  period: HistoryPeriod;
}) {
  const theme = useTheme();
  const chartColors = theme === "light" ? STATION_CHART_COLORS_LIGHT : STATION_CHART_COLORS;
  const periodLabel = HISTORY_PERIODS.find((item) => item.value === period)?.label ?? period;

  const { minTime, maxTime } = useMemo(() => {
    const times = stations.flatMap((station) => station.points.map((point) => new Date(point.dateTime).getTime()));
    return {
      minTime: times.length ? Math.min(...times) : Date.now(),
      maxTime: times.length ? Math.max(...times) : Date.now(),
    };
  }, [stations]);

  const summaries = stationSummaries(stations);

  return (
    <div className="station-card-list">
      {stations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
          color={colorForStation(station.id, chartColors)}
          period={period}
          minTime={minTime}
          maxTime={maxTime}
        />
      ))}

      <HistorySummaryTable periodLabel={periodLabel} summaries={summaries} />
    </div>
  );
}
