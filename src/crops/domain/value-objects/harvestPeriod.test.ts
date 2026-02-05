import { describe, expect, test } from "bun:test";
import { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";

describe("HarvestPeriod", () => {
  test("creates valid harvest period", () => {
    const period = HarvestPeriod.create(60, 120, 180);
    expect(period.getFirstHarvestDay()).toBe(60);
    expect(period.getLastHarvestDay()).toBe(120);
    expect(period.getLifespan()).toBe(180);
  });

  test("throws error when firstHarvestDay is greater than lastHarvestDay", () => {
    expect(() => HarvestPeriod.create(120, 60, 180)).toThrow(
      "First harvest day (120) must be less than or equal to last harvest day (60)",
    );
  });

  test("throws error when lastHarvestDay exceeds lifespan", () => {
    expect(() => HarvestPeriod.create(60, 200, 180)).toThrow("Last harvest day (200) cannot exceed lifespan (180)");
  });

  test("throws error when days are negative", () => {
    expect(() => HarvestPeriod.create(-10, 120, 180)).toThrow("Days must be non-negative");
    expect(() => HarvestPeriod.create(60, -10, 180)).toThrow("Days must be non-negative");
    expect(() => HarvestPeriod.create(60, 120, -10)).toThrow("Days must be non-negative");
  });

  test("overlaps returns true when periods overlap", () => {
    const period1 = HarvestPeriod.create(60, 120, 180);
    const period2 = HarvestPeriod.create(100, 150, 200);
    expect(period1.overlaps(period2)).toBe(true);
  });

  test("overlaps returns false when periods do not overlap", () => {
    const period1 = HarvestPeriod.create(60, 90, 120);
    const period2 = HarvestPeriod.create(100, 150, 200);
    expect(period1.overlaps(period2)).toBe(false);
  });

  test("overlaps returns true when periods touch at boundary", () => {
    const period1 = HarvestPeriod.create(60, 100, 120);
    const period2 = HarvestPeriod.create(100, 150, 200);
    expect(period1.overlaps(period2)).toBe(true);
  });

  test("allows firstHarvestDay equal to lastHarvestDay", () => {
    const period = HarvestPeriod.create(100, 100, 120);
    expect(period.getFirstHarvestDay()).toBe(100);
    expect(period.getLastHarvestDay()).toBe(100);
  });
});
