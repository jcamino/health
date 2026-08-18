import { describe, it, expect } from "vitest";
import {
  apoBTier,
  apoBBands,
  sources,
  referenceIntervalSources,
  APOB_REFERENCE_INTERVAL_UPPER_MGDL,
} from "../src/lib/calculators/apoB";

describe("apoBTier", () => {
  it("classifies representative values", () => {
    expect(apoBTier(55).tier).toBe("optimal");
    expect(apoBTier(70).tier).toBe("borderline");
    expect(apoBTier(90).tier).toBe("high");
    expect(apoBTier(120).tier).toBe("very-high");
  });

  it("uses correct boundaries (lower bound inclusive of the higher tier)", () => {
    expect(apoBTier(64.9).tier).toBe("optimal");
    expect(apoBTier(65).tier).toBe("borderline");
    expect(apoBTier(80).tier).toBe("high");
    expect(apoBTier(100).tier).toBe("very-high");
  });

  it("rejects non-physiologic input", () => {
    expect(() => apoBTier(-1)).toThrow();
    expect(() => apoBTier(NaN)).toThrow();
  });

  it("ships with at least one source", () => {
    expect(sources.length).toBeGreaterThan(0);
  });
});

describe("apoBBands", () => {
  it("are ascending, contiguous, and open-ended at the top", () => {
    expect(apoBBands.map((b) => b.lower)).toEqual([0, 65, 80, 100]);
    expect(apoBBands.map((b) => b.upper)).toEqual([65, 80, 100, null]);
  });

  it("agree with apoBTier at representative values", () => {
    for (const v of [10, 64, 65, 79, 80, 99, 100, 150]) {
      const band = apoBBands.find((b) => b.upper === null || v < b.upper)!;
      expect(band.name).toBe(apoBTier(v).tier);
    }
  });
});

describe("APOB_REFERENCE_INTERVAL_UPPER_MGDL", () => {
  it("is the top of a typical laboratory reference interval", () => {
    expect(APOB_REFERENCE_INTERVAL_UPPER_MGDL).toBe(130);
  });

  it("sits between the two upper limits its source reports", () => {
    expect(APOB_REFERENCE_INTERVAL_UPPER_MGDL).toBeGreaterThanOrEqual(129);
    expect(APOB_REFERENCE_INTERVAL_UPPER_MGDL).toBeLessThanOrEqual(134);
  });

  it("lands in this site's very-high tier, which is the hero's whole point", () => {
    expect(apoBTier(APOB_REFERENCE_INTERVAL_UPPER_MGDL).tier).toBe("very-high");
  });

  it("carries the reference-interval citation", () => {
    expect(referenceIntervalSources.map((s) => s.id)).toContain(
      "choiApoBReferenceInterval2023",
    );
  });
});
