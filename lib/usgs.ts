export const E_COLI_THRESHOLD = 235;

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

export function buildSummary(stations: StationReading[]): BacteriaReport["summary"] {
  const safe = stations.filter((s) => s.risk === "low");
  const unsafe = stations.filter((s) => s.risk === "high");
  const safeCount = safe.length;
  const totalCount = stations.length;

  if (safeCount === totalCount) {
    return {
      headline: "Not poopy",
      message: "You're good to go.",
      overallSafe: true,
      safeCount,
      totalCount,
    };
  }

  if (safeCount === 0) {
    return {
      headline: "Poopy",
      message: "Stay out of the water today.",
      overallSafe: false,
      safeCount,
      totalCount,
    };
  }

  const safeNames = safe.map((s) => s.name).join(" & ");
  const unsafeNames = unsafe.map((s) => s.name).join(" & ");
  return {
    headline: "Partly poopy",
    message: `${safeNames} are fine. Avoid ${unsafeNames}.`,
    overallSafe: false,
    safeCount,
    totalCount,
  };
}

export const USGS_IV_URL =
  "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=02335000,02335880,02336000&parameterCd=99407,63680&siteStatus=all";

export async function fetchBacteriaReport(): Promise<BacteriaReport> {
  const res = await fetch(USGS_IV_URL, {
    headers: { Accept: "application/json" },
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
