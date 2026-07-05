import { describe, expect, it } from "vitest";

import {
  PUT_IN_DETAIL_ZOOM,
  PUT_INS,
  defaultPutIns,
  putInsForZoom,
} from "@/lib/put-ins";

describe("putInsForZoom", () => {
  it("shows default put-ins below the detail zoom level", () => {
    const visible = putInsForZoom(PUT_IN_DETAIL_ZOOM - 1).map((p) => p.id);

    expect(visible).toContain("johnson-ferry");
    expect(visible).toContain("morgan-falls");
    expect(visible).toContain("abbotts-bridge");
    expect(visible).not.toContain("whitewater-creek");
    expect(visible).not.toContain("medlock-bridge");
  });

  it("adds detail put-ins at zoom 12 and above", () => {
    const visible = putInsForZoom(PUT_IN_DETAIL_ZOOM).map((p) => p.id);

    expect(visible).toContain("whitewater-creek");
    expect(visible).toContain("paces-mill");
    expect(visible.length).toBeGreaterThan(defaultPutIns().length);
  });
});

describe("PUT_INS", () => {
  it("uses unique ids", () => {
    const ids = PUT_INS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("snaps every put-in near the river outline", () => {
    for (const putIn of PUT_INS) {
      const raw = putIn.id;
      // Snapped coords should stay within the monitored stretch.
      expect(putIn.lat).toBeGreaterThan(33.85);
      expect(putIn.lat).toBeLessThan(34.02);
      expect(putIn.lng).toBeGreaterThan(-84.46);
      expect(putIn.lng).toBeLessThan(-84.19);
      expect(raw).toBeTruthy();
    }
  });
});

describe("defaultPutIns", () => {
  it("matches the sub-detail zoom filter", () => {
    expect(defaultPutIns().map((p) => p.id)).toEqual(
      putInsForZoom(PUT_IN_DETAIL_ZOOM - 1).map((p) => p.id),
    );
  });
});
