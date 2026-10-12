import { describe, expect, it } from "vitest";

import { snapToRiverLine } from "@/lib/map/snap-to-river";

describe("snapToRiverLine", () => {
  const line: [number, number][] = [
    [-84.4, 33.9],
    [-84.3, 33.95],
    [-84.2, 34.0],
  ];

  it("returns the original point when the line is empty", () => {
    const point = { lat: 33.93, lng: -84.32 };
    expect(snapToRiverLine([], point)).toEqual(point);
  });

  it("snaps an off-river point to the nearest segment", () => {
    const point = { lat: 33.93, lng: -84.32 };
    const snapped = snapToRiverLine(line, point);

    expect(snapped.lat).toBeGreaterThan(point.lat);
    expect(snapped.lng).toBeCloseTo(-84.35, 1);
    expect(snapToRiverLine(line, snapped)).toEqual(snapped);
  });

  it("leaves a point that is already on the line unchanged", () => {
    const point = { lat: 33.95, lng: -84.3 };
    expect(snapToRiverLine(line, point)).toEqual(point);
  });
});
