import { describe, expect, test } from "bun:test";
import {
  GrowingRequirements,
  RootDepth,
  Season,
  SunRequirement,
} from "@/crops/domain/value-objects/growingRequirements";

describe("GrowingRequirements", () => {
  test("creates valid growing requirements", () => {
    const requirements = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]);
    expect(requirements.getSunRequirement()).toBe(SunRequirement.FULL_SUN);
    expect(requirements.getRootDepth()).toBe(RootDepth.DEEP);
    expect(requirements.getSeasons()).toEqual([Season.SUMMER]);
  });

  test("throws error when seasons array is empty", () => {
    expect(() => GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [])).toThrow(
      "At least one season is required",
    );
  });

  test("allows multiple seasons", () => {
    const requirements = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.MEDIUM, [
      Season.SPRING,
      Season.FALL,
    ]);
    expect(requirements.getSeasons()).toEqual([Season.SPRING, Season.FALL]);
  });

  describe("isCompatibleWith - sun requirements", () => {
    test("same sun requirement is compatible", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]);
      const req2 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.MEDIUM, [Season.SUMMER]);
      expect(req1.isCompatibleWith(req2)).toBe(true);
    });

    test("different sun requirements are incompatible", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]);
      const req2 = GrowingRequirements.create(SunRequirement.FULL_SHADE, RootDepth.DEEP, [Season.SUMMER]);
      expect(req1.isCompatibleWith(req2)).toBe(false);
    });
  });

  describe("isCompatibleWith - season overlap", () => {
    test("overlapping seasons are compatible", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SPRING, Season.SUMMER]);
      const req2 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.MEDIUM, [Season.SUMMER, Season.FALL]);
      expect(req1.isCompatibleWith(req2)).toBe(true);
    });

    test("non-overlapping seasons are incompatible", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SPRING]);
      const req2 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.FALL]);
      expect(req1.isCompatibleWith(req2)).toBe(false);
    });

    test("identical seasons are compatible", () => {
      const req1 = GrowingRequirements.create(SunRequirement.PARTIAL_SHADE, RootDepth.SHALLOW, [Season.SUMMER]);
      const req2 = GrowingRequirements.create(SunRequirement.PARTIAL_SHADE, RootDepth.DEEP, [Season.SUMMER]);
      expect(req1.isCompatibleWith(req2)).toBe(true);
    });
  });

  describe("isCompatibleWith - root depth (no restriction)", () => {
    test("different root depths are compatible (all depths compatible)", () => {
      const shallow = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [Season.SUMMER]);
      const deep = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]);
      expect(shallow.isCompatibleWith(deep)).toBe(true);
    });

    test("same root depths are compatible", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.MEDIUM, [Season.SUMMER]);
      const req2 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.MEDIUM, [Season.SUMMER]);
      expect(req1.isCompatibleWith(req2)).toBe(true);
    });
  });

  describe("isCompatibleWith - combined requirements", () => {
    test("incompatible sun overrides season overlap", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]);
      const req2 = GrowingRequirements.create(SunRequirement.PARTIAL_SHADE, RootDepth.DEEP, [Season.SUMMER]);
      expect(req1.isCompatibleWith(req2)).toBe(false);
    });

    test("incompatible season overrides sun compatibility", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SPRING]);
      const req2 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.FALL]);
      expect(req1.isCompatibleWith(req2)).toBe(false);
    });

    test("all compatible requirements succeed", () => {
      const req1 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [
        Season.SPRING,
        Season.SUMMER,
      ]);
      const req2 = GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER, Season.FALL]);
      expect(req1.isCompatibleWith(req2)).toBe(true);
    });
  });
});
