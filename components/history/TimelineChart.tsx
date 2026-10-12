"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  E_COLI_THRESHOLD,
  HISTORY_PERIODS,
  riskFromEcoli,
  STATION_CHART_COLORS,
  STATION_CHART_COLORS_LIGHT,
  type HistoryPeriod,
  type StationHistory,
} from "@/lib/bacteria/usgs";
import { useTheme } from "@/lib/use-theme";

import {
  buildLinePath,
  buildXAxisTicks,
  colorForStation,
  findNearestPoint,
  formatAxisTime,
  formatHoverDate,
  stationSummaries,
  xAxisTickCount,
} from "./chart-utils";
import { HistorySummaryTable } from "./HistorySummaryTable";
import { useNarrowChart } from "./use-narrow-chart";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const PADDING = { top: 14, right: 10, bottom: 30, left: 42 };

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

export function TimelineChart({
  stations,
  period,
}: {
  stations: StationHistory[];
  period: HistoryPeriod;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const narrow = useNarrowChart();
  const theme = useTheme();
  const chartColors = theme === "light" ? STATION_CHART_COLORS_LIGHT : STATION_CHART_COLORS;
  const [hover, setHover] = useState<HoverState | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [tooltipShiftPx, setTooltipShiftPx] = useState(0);

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

  const summaries = useMemo(() => stationSummaries(stations), [stations]);

  const xScale = (iso: string) => {
    const time = new Date(iso).getTime();
    const span = maxTime - minTime || 1;
    return PADDING.left + ((time - minTime) / span) * plotWidth;
  };

  const yScale = (value: number) => PADDING.top + plotHeight - (value / yMax) * plotHeight;

  const timeFromX = (x: number) => {
    const plotX = x - PADDING.left;
    const span = maxTime - minTime || 1;
    return minTime + (plotX / plotWidth) * span;
  };

  const hoverFromTime = (targetTime: number, xHint?: number): HoverState | null => {
    const readings: HoverReading[] = [];
    let nearestDateTime: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const station of stations) {
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
        color: colorForStation(station.id, chartColors),
        eColi: point.eColi,
        risk: riskFromEcoli(point.eColi),
        x: xScale(point.dateTime),
        y: yScale(point.eColi),
      });
    }

    if (readings.length === 0 || !nearestDateTime) return null;

    const span = maxTime - minTime || 1;
    const x =
      xHint ?? PADDING.left + ((new Date(nearestDateTime).getTime() - minTime) / span) * plotWidth;

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

  useLayoutEffect(() => {
    if (!hover || narrow) {
      setTooltipShiftPx(0);
      return;
    }

    const update = () => {
      const wrap = wrapRef.current;
      const tip = tooltipRef.current;
      if (!wrap || !tip) return;

      const wrapWidth = wrap.clientWidth;
      const tipWidth = tip.offsetWidth;
      const margin = 8;
      const hoverX = (hover.x / CHART_WIDTH) * wrapWidth;
      const maxShift = Math.max(wrapWidth - margin * 2 - tipWidth, 0);
      const desired = hoverX - margin - tipWidth / 2;
      setTooltipShiftPx(Math.min(Math.max(desired, 0), maxShift));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [hover, narrow]);

  const periodLabel = HISTORY_PERIODS.find((item) => item.value === period)?.label ?? period;
  const liveText = hover
    ? `${formatHoverDate(hover.dateTime, period)}. ${hover.readings
        .map((reading) => `${reading.name}: ${Math.round(reading.eColi)} cfu per 100 mL`)
        .join(". ")}`
    : "";

  return (
    <div ref={wrapRef} className={`timeline-chart-wrap${narrow ? " is-narrow" : ""}`}>
      {hover && (
        <div
          ref={tooltipRef}
          className="timeline-tooltip"
          style={
            narrow
              ? undefined
              : { transform: `translateX(${tooltipShiftPx}px) translateY(calc(-100% - 0.35rem))` }
          }
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

        {stations.map((station) => (
          <path
            key={station.id}
            d={buildLinePath(station.points, xScale, yScale)}
            className="timeline-line"
            stroke={colorForStation(station.id, chartColors)}
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
            <text key={time} x={x} y={CHART_HEIGHT - 8} className="timeline-axis-label" textAnchor={anchor}>
              {formatAxisTime(time, period, narrow)}
            </text>
          );
        })}
      </svg>

      <HistorySummaryTable periodLabel={periodLabel} summaries={summaries} />
    </div>
  );
}
