import {
  E_COLI_THRESHOLD,
  STATION_CHART_COLORS,
  type HistoryPoint,
  type StationHistory,
} from "@/lib/usgs";

const WIDTH = 88;
const HEIGHT = 32;
const PADDING = 2;

function buildSparklinePath(
  points: HistoryPoint[],
  xScale: (time: number) => number,
  yScale: (value: number) => number,
): string {
  if (points.length === 0) return "";

  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      const x = xScale(new Date(point.dateTime).getTime());
      const y = yScale(point.eColi);
      return `${command}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function HistorySparkline({ stations }: { stations: StationHistory[] }) {
  const allPoints = stations.flatMap((station) => station.points);
  if (allPoints.length === 0) return null;

  const times = allPoints.map((point) => new Date(point.dateTime).getTime());
  const values = allPoints.map((point) => point.eColi);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const yMax = Math.max(Math.max(...values) * 1.1, E_COLI_THRESHOLD * 1.2, 300);
  const plotWidth = WIDTH - PADDING * 2;
  const plotHeight = HEIGHT - PADDING * 2;

  const xScale = (time: number) => PADDING + ((time - minTime) / (maxTime - minTime || 1)) * plotWidth;
  const yScale = (value: number) => PADDING + plotHeight - (value / yMax) * plotHeight;
  const thresholdY = yScale(E_COLI_THRESHOLD);

  return (
    <svg className="history-sparkline" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
      <line
        x1={PADDING}
        x2={WIDTH - PADDING}
        y1={thresholdY}
        y2={thresholdY}
        className="history-sparkline-threshold"
      />
      {stations.map((station, index) => (
        <path
          key={station.id}
          d={buildSparklinePath(station.points, xScale, yScale)}
          stroke={STATION_CHART_COLORS[index % STATION_CHART_COLORS.length]}
          className="history-sparkline-line"
          fill="none"
        />
      ))}
    </svg>
  );
}
