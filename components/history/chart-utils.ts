import { E_COLI_THRESHOLD, STATIONS, type HistoryPeriod, type HistoryPoint } from "@/lib/bacteria/usgs";

export function formatAxisTime(time: number, period: HistoryPeriod, narrow = false): string {
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

export function formatHoverDate(iso: string, period: HistoryPeriod): string {
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

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function colorForStation(stationId: string, colors: readonly string[]): string {
  const index = STATIONS.findIndex((station) => station.id === stationId);
  return colors[(index < 0 ? 0 : index) % colors.length]!;
}

export function findNearestPoint(points: HistoryPoint[], targetTime: number): HistoryPoint | null {
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

export function buildLinePath(
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

export function buildXAxisTicks(minTime: number, maxTime: number, count: number): number[] {
  if (count <= 1 || maxTime <= minTime) return [minTime];

  return Array.from({ length: count }, (_, index) => minTime + ((maxTime - minTime) * index) / (count - 1));
}

export function xAxisTickCount(period: HistoryPeriod, narrow = false): number {
  if (narrow) return 4;

  switch (period) {
    case "P7D":
      return 5;
    case "P30D":
      return 6;
    case "P120D":
      return 5;
  }
}

function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * q;
  const lo = Math.floor(index);
  const hi = Math.ceil(index);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (index - lo);
}

export function visualYMax(values: number[]): number {
  const floor = Math.max(E_COLI_THRESHOLD * 2.5, 400);
  if (values.length === 0) return floor;
  return Math.max(floor, quantile(values, 0.75) * 1.35);
}

export function stationSummaries(stations: Array<{ id: string; name: string; points: HistoryPoint[] }>) {
  return stations.map((station) => {
    const values = station.points.map((point) => point.eColi);
    const latest = station.points.at(-1);
    return {
      id: station.id,
      name: station.name,
      latest: latest ? Math.round(latest.eColi) : null,
      highest: values.length ? Math.round(Math.max(...values)) : null,
      lowest: values.length ? Math.round(Math.min(...values)) : null,
    };
  });
}
