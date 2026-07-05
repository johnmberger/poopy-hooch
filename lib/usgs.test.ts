import { describe, expect, it } from "vitest";

import {
  E_COLI_THRESHOLD,
  buildSummary,
  parseUsgsResponse,
  riskFromEcoli,
  type StationReading,
  type UsgsIvResponse,
} from "@/lib/usgs";

function station(overrides: Partial<StationReading> & Pick<StationReading, "name" | "risk">): StationReading {
  return {
    id: "02335000",
    section: "Upstream",
    description: "test",
    lat: 33.99,
    lng: -84.2,
    labelDirection: "right",
    eColi: 100,
    turbidity: null,
    observedAt: "2026-07-04T22:00:00-04:00",
    ...overrides,
  };
}

function ecoliSeries(siteId: string, value: number, dateTime = "2026-07-04T22:00:00-04:00") {
  return {
    sourceInfo: { siteCode: [{ value: siteId }] },
    variable: { variableCode: [{ value: "99407" }], variableName: "E. coli" },
    values: [
      {
        value: [{ value: String(value), dateTime }],
        method: [{ methodDescription: "E. coli" }],
      },
    ],
  };
}

function turbiditySeries(siteId: string, value: number) {
  return {
    sourceInfo: { siteCode: [{ value: siteId }] },
    variable: { variableCode: [{ value: "63680" }], variableName: "Turbidity" },
    values: [{ value: [{ value: String(value), dateTime: "2026-07-04T22:00:00-04:00" }] }],
  };
}

describe("riskFromEcoli", () => {
  it("marks readings at or below the EPA threshold as low risk", () => {
    expect(riskFromEcoli(E_COLI_THRESHOLD)).toBe("low");
    expect(riskFromEcoli(0)).toBe("low");
  });

  it("marks readings above the EPA threshold as high risk", () => {
    expect(riskFromEcoli(E_COLI_THRESHOLD + 1)).toBe("high");
  });
});

describe("buildSummary", () => {
  it("returns an all-clear verdict when every station is clean", () => {
    const summary = buildSummary([
      station({ name: "Medlock Bridge", risk: "low" }),
      station({ name: "Powers Ferry", risk: "low" }),
      station({ name: "Paces Ferry", risk: "low" }),
    ]);

    expect(summary.overallSafe).toBe(true);
    expect(summary.headline).toBe("Not poopy at all");
    expect(summary.safeCount).toBe(3);
  });

  it("returns a full poopy verdict when every station is high", () => {
    const summary = buildSummary([
      station({ name: "Medlock Bridge", risk: "high", eColi: 400 }),
      station({ name: "Powers Ferry", risk: "high", eColi: 500 }),
      station({ name: "Paces Ferry", risk: "high", eColi: 600 }),
    ]);

    expect(summary.overallSafe).toBe(false);
    expect(summary.headline).toBe("Poopy all over");
  });

  it("returns a mixed verdict naming safe and unsafe stations", () => {
    const summary = buildSummary([
      station({ name: "Medlock Bridge", risk: "low" }),
      station({ name: "Powers Ferry", risk: "high", eColi: 300 }),
      station({ name: "Paces Ferry", risk: "low" }),
    ]);

    expect(summary.overallSafe).toBe(false);
    expect(summary.headline).toBe("Partly poopy");
    expect(summary.message).toContain("Medlock Bridge");
    expect(summary.message).toContain("Powers Ferry");
  });
});

describe("parseUsgsResponse", () => {
  it("maps USGS time series into station readings and summary", () => {
    const data: UsgsIvResponse = {
      value: {
        timeSeries: [
          ecoliSeries("02335000", 100),
          ecoliSeries("02335880", 61),
          ecoliSeries("02336000", 240),
          turbiditySeries("02335000", 2.2),
        ],
      },
    };

    const report = parseUsgsResponse(data);

    expect(report.stations).toHaveLength(3);
    expect(report.stations[0]).toMatchObject({ name: "Medlock Bridge", eColi: 100, risk: "low", turbidity: 2.2 });
    expect(report.stations[1]).toMatchObject({ name: "Powers Ferry", eColi: 61, risk: "low" });
    expect(report.stations[2]).toMatchObject({ name: "Paces Ferry", eColi: 240, risk: "high" });
    expect(report.summary.headline).toBe("Partly poopy");
  });

  it("throws when a station is missing E. coli data", () => {
    const data: UsgsIvResponse = {
      value: { timeSeries: [ecoliSeries("02335000", 100)] },
    };

    expect(() => parseUsgsResponse(data)).toThrow(/Missing E\. coli data/);
  });
});
