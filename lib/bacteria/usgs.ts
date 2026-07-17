export const E_COLI_THRESHOLD = 235;

export const USGS_BACTERIA_URL = "https://ga.water.usgs.gov/bacteria/";

export const STATION_CHART_COLORS = ["#93c5fd", "#a78bfa", "#fbbf24"] as const;
/** Distinct station series colors for light backgrounds (hue-separated, WCAG non-text ≥3:1). */
export const STATION_CHART_COLORS_LIGHT = ["#1d4ed8", "#0f766e", "#7e22ce"] as const;

export const STATIONS = [
  {
    id: "02335000",
    name: "Medlock Bridge",
    section: "Upstream (Norcross / Duluth area)",
    description: "Popular put-in near Medlock Bridge Road",
    lat: 33.9972222,
    lng: -84.2019444,
    labelDirection: "right" as const,
  },
  {
    id: "02335880",
    name: "Powers Ferry",
    section: "Middle (Sandy Springs / I-285 area)",
    description: "Mid-river section near Powers Ferry Road",
    lat: 33.9019722,
    lng: -84.4430278,
    labelDirection: "right" as const,
  },
  {
    id: "02336000",
    name: "Paces Ferry",
    section: "Downstream (Atlanta / Vinings area)",
    description: "Lower CRNRA section near Paces Ferry Road",
    lat: 33.85916667,
    lng: -84.4544444,
    labelDirection: "left" as const,
  },
] as const;

export type RiskLevel = "low" | "high";

export interface StationReading {
  id: string;
  name: string;
  section: string;
  description: string;
  lat: number;
  lng: number;
  labelDirection: "left" | "right";
  eColi: number;
  turbidity: number | null;
  observedAt: string;
  risk: RiskLevel;
}

export interface BacteriaReport {
  updatedAt: string;
  stations: StationReading[];
  summary: {
    headline: string;
    message: string;
    overallSafe: boolean;
    safeCount: number;
    totalCount: number;
  };
}

interface TimeSeriesValue {
  value: string;
  dateTime: string;
}

interface TimeSeriesEntry {
  sourceInfo: { siteCode: Array<{ value: string }> };
  variable: {
    variableCode: Array<{ value: string }>;
    variableName: string;
  };
  values: Array<{
    value: TimeSeriesValue[];
    method?: Array<{ methodDescription?: string }>;
  }>;
}

export interface UsgsIvResponse {
  value?: {
    timeSeries?: TimeSeriesEntry[];
  };
}

function parseEcoliValue(entry: TimeSeriesEntry): number | null {
  for (const valuesBlock of entry.values) {
    const method = valuesBlock.method?.[0]?.methodDescription ?? "";
    if (method.includes("E. coli") && !method.includes("Std Deviation") && !method.includes("Prediction")) {
      const raw = valuesBlock.value[0]?.value;
      const num = Number(raw);
      return Number.isFinite(num) && num >= 0 ? num : null;
    }
  }
  return null;
}

function parseLatestValue(entry: TimeSeriesEntry): { value: number; dateTime: string } | null {
  const raw = entry.values[0]?.value[0];
  if (!raw) return null;
  const num = Number(raw.value);
  if (!Number.isFinite(num) || num < 0) return null;
  return { value: num, dateTime: raw.dateTime };
}

export function riskFromEcoli(eColi: number): RiskLevel {
  return eColi <= E_COLI_THRESHOLD ? "low" : "high";
}

export const RIVER_CLEAN_COLOR = "#4ade80";
export const RIVER_POOPY_COLOR = "#f87171";
export const RIVER_CLEAN_COLOR_LIGHT = "#15803d";
export const RIVER_POOPY_COLOR_LIGHT = "#b91c1c";

export type RiverColorPalette = {
  clean: string;
  poopy: string;
};

export const RIVER_COLORS_DARK: RiverColorPalette = {
  clean: RIVER_CLEAN_COLOR,
  poopy: RIVER_POOPY_COLOR,
};

export const RIVER_COLORS_LIGHT: RiverColorPalette = {
  clean: RIVER_CLEAN_COLOR_LIGHT,
  poopy: RIVER_POOPY_COLOR_LIGHT,
};

const RIVER_GRADIENT_STEPS = 8;

export interface RiverGradientPart {
  coordinates: [number, number][];
  color: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function blendRiverColors(
  from: RiskLevel,
  to: RiskLevel,
  amount: number,
  colors: RiverColorPalette = RIVER_COLORS_DARK,
): string {
  const clamped = Math.min(Math.max(amount, 0), 1);
  const fromRgb = hexToRgb(from === "low" ? colors.clean : colors.poopy);
  const toRgb = hexToRgb(to === "low" ? colors.clean : colors.poopy);
  return rgbToHex([
    Math.round(fromRgb[0] + (toRgb[0] - fromRgb[0]) * clamped),
    Math.round(fromRgb[1] + (toRgb[1] - fromRgb[1]) * clamped),
    Math.round(fromRgb[2] + (toRgb[2] - fromRgb[2]) * clamped),
  ]);
}

/** Fade river color between two station readings along the segment. */
export function riverSegmentGradient(
  upstream: RiskLevel,
  downstream: RiskLevel,
  coordinates: [number, number][],
  colors: RiverColorPalette = RIVER_COLORS_DARK,
): RiverGradientPart[] {
  if (coordinates.length < 2) return [];

  if (upstream === downstream) {
    return [{ coordinates, color: blendRiverColors(upstream, downstream, 0, colors) }];
  }

  const steps = Math.min(RIVER_GRADIENT_STEPS, coordinates.length - 1);
  const lastIndex = coordinates.length - 1;
  const parts: RiverGradientPart[] = [];

  for (let step = 0; step < steps; step++) {
    const startIdx = Math.round((step / steps) * lastIndex);
    let endIdx = Math.round(((step + 1) / steps) * lastIndex);
    if (step === steps - 1) endIdx = lastIndex;
    if (endIdx <= startIdx) continue;

    const amount = steps === 1 ? 0.5 : step / (steps - 1);
    parts.push({
      coordinates: coordinates.slice(startIdx, endIdx + 1),
      color: blendRiverColors(upstream, downstream, amount, colors),
    });
  }

  return parts.length > 0
    ? parts
    : [{ coordinates, color: blendRiverColors(upstream, downstream, 0.5, colors) }];
}

export function buildSummary(stations: StationReading[]): BacteriaReport["summary"] {
  const safe = stations.filter((s) => s.risk === "low");
  const unsafe = stations.filter((s) => s.risk === "high");
  const safeCount = safe.length;
  const totalCount = stations.length;

  if (safeCount === totalCount) {
    return {
      headline: "Not poopy at all",
      message: "You're good to go - the sewers are behaving today.",
      overallSafe: true,
      safeCount,
      totalCount,
    };
  }

  if (safeCount === 0) {
    return {
      headline: "Poopy all over",
      message: "Stay out of the water today, or go poop the Hooch — it's the right thing to do.",
      overallSafe: false,
      safeCount,
      totalCount,
    };
  }

  const safeNames = safe.map((s) => s.name).join(" & ");
  const unsafeNames = unsafe.map((s) => s.name).join(" & ");
  const safeVerb = safe.length === 1 ? "is" : "are";
  return {
    headline: "Partly poopy",
    message: `Avoid ${unsafeNames}. ${safeNames} ${safeVerb} fine — but you could change that! 😀`,
    overallSafe: false,
    safeCount,
    totalCount,
  };
}

export const USGS_IV_URL =
  "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=02335000,02335880,02336000&parameterCd=99407,63680&siteStatus=all";

export type HistoryPeriod = "P7D" | "P30D" | "P120D";

export const HISTORY_PERIODS: { value: HistoryPeriod; label: string }[] = [
  { value: "P7D", label: "7 days" },
  { value: "P30D", label: "30 days" },
  { value: "P120D", label: "4 months" },
];

export interface HistoryPoint {
  dateTime: string;
  eColi: number;
}

export interface StationHistory {
  id: string;
  name: string;
  points: HistoryPoint[];
}

export interface BacteriaHistoryReport {
  period: HistoryPeriod;
  stations: StationHistory[];
}

export const MAX_HISTORY_CHART_POINTS = 400;
/** Enough points for an 88px sparkline without shipping a full week of IV data. */
export const MAX_HISTORY_SPARKLINE_POINTS = 32;

function parseEcoliHistory(entry: TimeSeriesEntry): HistoryPoint[] {
  for (const valuesBlock of entry.values) {
    const method = valuesBlock.method?.[0]?.methodDescription ?? "";
    if (method.includes("E. coli") && !method.includes("Std Deviation") && !method.includes("Prediction")) {
      return valuesBlock.value
        .map((raw) => {
          const num = Number(raw.value);
          return Number.isFinite(num) && num >= 0 ? { eColi: num, dateTime: raw.dateTime } : null;
        })
        .filter((point): point is HistoryPoint => point !== null);
    }
  }
  return [];
}

export function downsampleHistory(points: HistoryPoint[], maxPoints: number): HistoryPoint[] {
  if (points.length <= maxPoints) return points;

  const bucketSize = Math.ceil(points.length / maxPoints);
  const result: HistoryPoint[] = [];

  for (let i = 0; i < points.length; i += bucketSize) {
    const bucket = points.slice(i, i + bucketSize);
    const peak = bucket.reduce((best, point) => (point.eColi > best.eColi ? point : best), bucket[0]!);
    result.push(peak);
  }

  return result;
}

export function downsampleHistoryReport(
  report: BacteriaHistoryReport,
  maxPoints: number = MAX_HISTORY_SPARKLINE_POINTS,
): BacteriaHistoryReport {
  return {
    ...report,
    stations: report.stations.map((station) => ({
      ...station,
      points: downsampleHistory(station.points, maxPoints),
    })),
  };
}

export function usgsHistoryUrl(period: HistoryPeriod): string {
  const sites = STATIONS.map((station) => station.id).join(",");
  return `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${sites}&parameterCd=99407&period=${period}&siteStatus=all`;
}

export function parseUsgsHistoryResponse(data: UsgsIvResponse, period: HistoryPeriod): BacteriaHistoryReport {
  const timeSeries = data.value?.timeSeries ?? [];
  const historyBySite = new Map<string, HistoryPoint[]>();

  for (const entry of timeSeries) {
    const siteId = entry.sourceInfo.siteCode[0]?.value;
    const paramCode = entry.variable.variableCode[0]?.value;
    if (!siteId || paramCode !== "99407") continue;

    const points = parseEcoliHistory(entry);
    if (points.length) historyBySite.set(siteId, points);
  }

  const stations: StationHistory[] = STATIONS.map((station) => {
    const points = historyBySite.get(station.id) ?? [];
    const sorted = [...points].sort((a, b) => a.dateTime.localeCompare(b.dateTime));
    return {
      id: station.id,
      name: station.name,
      points: downsampleHistory(sorted, MAX_HISTORY_CHART_POINTS),
    };
  });

  return { period, stations };
}

export async function fetchBacteriaHistory(period: HistoryPeriod): Promise<BacteriaHistoryReport> {
  const res = await fetch(usgsHistoryUrl(period), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`USGS API returned ${res.status}`);
  }

  const data = (await res.json()) as UsgsIvResponse;
  return parseUsgsHistoryResponse(data, period);
}

export async function fetchBacteriaReport(): Promise<BacteriaReport> {
  const res = await fetch(USGS_IV_URL, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`USGS API returned ${res.status}`);
  }

  const data = (await res.json()) as UsgsIvResponse;
  return parseUsgsResponse(data);
}

export function parseUsgsResponse(data: UsgsIvResponse): BacteriaReport {
  const timeSeries = data.value?.timeSeries ?? [];

  const ecoliBySite = new Map<string, { value: number; dateTime: string }>();
  const turbidityBySite = new Map<string, { value: number; dateTime: string }>();

  for (const entry of timeSeries) {
    const siteId = entry.sourceInfo.siteCode[0]?.value;
    const paramCode = entry.variable.variableCode[0]?.value;
    if (!siteId) continue;

    if (paramCode === "99407") {
      const parsed = parseEcoliValue(entry);
      const dateTime = entry.values[0]?.value[0]?.dateTime ?? new Date().toISOString();
      if (parsed !== null) ecoliBySite.set(siteId, { value: parsed, dateTime });
    } else if (paramCode === "63680") {
      const parsed = parseLatestValue(entry);
      if (parsed) turbidityBySite.set(siteId, parsed);
    }
  }

  const stations: StationReading[] = STATIONS.map((station) => {
    const ecoli = ecoliBySite.get(station.id);
    if (!ecoli) {
      throw new Error(`Missing E. coli data for station ${station.id}`);
    }
    const turbidity = turbidityBySite.get(station.id);

    return {
      ...station,
      eColi: ecoli.value,
      turbidity: turbidity?.value ?? null,
      observedAt: ecoli.dateTime,
      risk: riskFromEcoli(ecoli.value),
    };
  });

  return {
    updatedAt: new Date().toISOString(),
    stations,
    summary: buildSummary(stations),
  };
}
