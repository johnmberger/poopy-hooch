import { describe, expect, it } from "vitest";

import {
  E_COLI_THRESHOLD,
  buildSummary,
  downsampleHistory,
  parseUsgsHistoryResponse,
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

function ecoliHistorySeries(siteId: string, points: Array<{ value: number; dateTime: string }>) {
  return {
    sourceInfo: { siteCode: [{ value: siteId }] },
    variable: { variableCode: [{ value: "99407" }], variableName: "E. coli" },
    values: [
      {
        value: points.map((point) => ({ value: String(point.value), dateTime: point.dateTime })),
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
    expect(summary.message).toBe("Medlock Bridge & Paces Ferry are fine. Avoid Powers Ferry.");
  });

  it("uses singular grammar when only one station is clean", () => {
    const summary = buildSummary([
      station({ name: "Medlock Bridge", risk: "high", eColi: 300 }),
      station({ name: "Powers Ferry", risk: "high", eColi: 400 }),
      station({ name: "Paces Ferry", risk: "low" }),
    ]);

    expect(summary.message).toBe("Paces Ferry is fine. Avoid Medlock Bridge & Powers Ferry.");
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

describe("downsampleHistory", () => {
  it("keeps peak readings when downsampling", () => {
    const points = [
      { dateTime: "2026-07-01T00:00:00-04:00", eColi: 10 },
      { dateTime: "2026-07-01T01:00:00-04:00", eColi: 500 },
      { dateTime: "2026-07-01T02:00:00-04:00", eColi: 20 },
      { dateTime: "2026-07-01T03:00:00-04:00", eColi: 30 },
    ];

    const downsampled = downsampleHistory(points, 2);

    expect(downsampled).toHaveLength(2);
    expect(downsampled.some((point) => point.eColi === 500)).toBe(true);
  });
});

describe("parseUsgsHistoryResponse", () => {
  it("maps historical E. coli time series for each station", () => {
    const data: UsgsIvResponse = {
      value: {
        timeSeries: [
          ecoliHistorySeries("02335000", [
            { value: 120, dateTime: "2026-07-01T10:00:00-04:00" },
            { value: 180, dateTime: "2026-07-02T10:00:00-04:00" },
          ]),
          ecoliHistorySeries("02335880", [{ value: 90, dateTime: "2026-07-01T10:00:00-04:00" }]),
          ecoliHistorySeries("02336000", [{ value: 260, dateTime: "2026-07-01T10:00:00-04:00" }]),
        ],
      },
    };

    const history = parseUsgsHistoryResponse(data, "P7D");

    expect(history.period).toBe("P7D");
    expect(history.stations).toHaveLength(3);
    expect(history.stations[0]?.points).toEqual([
      { eColi: 120, dateTime: "2026-07-01T10:00:00-04:00" },
      { eColi: 180, dateTime: "2026-07-02T10:00:00-04:00" },
    ]);
    expect(history.stations[2]?.points[0]).toEqual({
      eColi: 260,
      dateTime: "2026-07-01T10:00:00-04:00",
    });
  });
});
