import { describe, expect, test } from "bun:test";
import { Crop } from "@/crops/domain/aggregates/crop";
import {
  CannotAssociateCropToItself,
  ForbiddenCompanionAssociation,
  IncompatibleGrowingRequirements,
} from "@/crops/domain/exceptions/errors";
import { CropName } from "@/crops/domain/value-objects/cropName";
import {
  GrowingRequirements,
  RootDepth,
  Season,
  SunRequirement,
} from "@/crops/domain/value-objects/growingRequirements";
import { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";

class MockCompanionRegistry {
  private helpfulRelationships = new Map<string, Set<string>>();
  private forbiddenRelationships = new Map<string, Set<string>>();
  private requiredRelationships = new Map<string, Set<string>>();

  addHelpful(crop: string, companion: string): void {
    if (!this.helpfulRelationships.has(crop)) {
      this.helpfulRelationships.set(crop, new Set());
    }
    this.helpfulRelationships.get(crop)?.add(companion);
  }

  addForbidden(crop: string, companion: string): void {
    if (!this.forbiddenRelationships.has(crop)) {
      this.forbiddenRelationships.set(crop, new Set());
    }
    this.forbiddenRelationships.get(crop)?.add(companion);
  }

  addRequired(crop: string, companion: string): void {
    if (!this.requiredRelationships.has(crop)) {
      this.requiredRelationships.set(crop, new Set());
    }
    this.requiredRelationships.get(crop)?.add(companion);
  }

  isHelpful(crop: CropName, companion: CropName): boolean {
    const companions = this.helpfulRelationships.get(crop.getValue());
    return companions?.has(companion.getValue()) ?? false;
  }

  isForbidden(crop: CropName, companion: CropName): boolean {
    const forbidden = this.forbiddenRelationships.get(crop.getValue());
    return forbidden?.has(companion.getValue()) ?? false;
  }

  isRequired(crop: CropName, companion: CropName): boolean {
    const required = this.requiredRelationships.get(crop.getValue());
    return required?.has(companion.getValue()) ?? false;
  }

  getRequiredCompanions(crop: CropName): CropName[] {
    const required = this.requiredRelationships.get(crop.getValue()) || new Set();
    return Array.from(required).map((name) => CropName.create(name));
  }

  getHelpfulCompanions(crop: CropName): CropName[] {
    const companions = this.helpfulRelationships.get(crop.getValue()) || new Set();
    return Array.from(companions).map((name) => CropName.create(name));
  }

  getForbiddenCompanions(crop: CropName): CropName[] {
    const forbidden = this.forbiddenRelationships.get(crop.getValue()) || new Set();
    return Array.from(forbidden).map((name) => CropName.create(name));
  }
}

describe("Crop", () => {
  describe("create", () => {
    test("creates valid crop", () => {
      const registry = new MockCompanionRegistry();
      const crop = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );

      expect(crop.getName().getValue()).toBe("tomato");
      expect(crop.getCompanions()).toHaveLength(0);
    });
  });

  describe("associateCompanion - Invariant #3: No self-companion", () => {
    test("throws CannotAssociateCropToItself when associating with itself", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );

      expect(() => tomato.associateCompanion(tomato)).toThrow(CannotAssociateCropToItself);
      expect(() => tomato.associateCompanion(tomato)).toThrow("cannot be associated with itself");
    });
  });

  describe("associateCompanion - Invariant #5: Sun compatibility", () => {
    test("throws IncompatibleGrowingRequirements for incompatible sun requirements", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const lettuce = Crop.create(
        CropName.create("lettuce"),
        HarvestPeriod.create(30, 60, 70),
        GrowingRequirements.create(SunRequirement.PARTIAL_SHADE, RootDepth.SHALLOW, [Season.SPRING]),
        registry,
      );

      expect(() => tomato.associateCompanion(lettuce)).toThrow(IncompatibleGrowingRequirements);
      expect(() => tomato.associateCompanion(lettuce)).toThrow("incompatible growing requirements");
    });

    test("allows association with compatible sun requirements", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const basil = Crop.create(
        CropName.create("basil"),
        HarvestPeriod.create(50, 80, 100),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [Season.SUMMER]),
        registry,
      );

      expect(() => tomato.associateCompanion(basil)).not.toThrow();
      expect(tomato.getCompanions()).toHaveLength(1);
    });
  });

  describe("associateCompanion - Invariant #6: Season overlap", () => {
    test("throws IncompatibleGrowingRequirements for non-overlapping seasons", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const lettuce = Crop.create(
        CropName.create("lettuce"),
        HarvestPeriod.create(30, 60, 70),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [Season.SPRING]),
        registry,
      );

      expect(() => tomato.associateCompanion(lettuce)).toThrow(IncompatibleGrowingRequirements);
      expect(() => tomato.associateCompanion(lettuce)).toThrow("incompatible growing requirements");
    });

    test("allows association with overlapping seasons", () => {
      const registry = new MockCompanionRegistry();
      const carrot = Crop.create(
        CropName.create("carrot"),
        HarvestPeriod.create(70, 90, 100),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.MEDIUM, [Season.SPRING, Season.FALL]),
        registry,
      );
      const leek = Crop.create(
        CropName.create("leek"),
        HarvestPeriod.create(80, 120, 150),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.MEDIUM, [Season.SPRING, Season.FALL]),
        registry,
      );

      expect(() => carrot.associateCompanion(leek)).not.toThrow();
    });
  });

  describe("associateCompanion - Invariant #4: Root depth (tracked, not enforced)", () => {
    test("allows association with different root depths", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const basil = Crop.create(
        CropName.create("basil"),
        HarvestPeriod.create(50, 80, 100),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [Season.SUMMER]),
        registry,
      );

      expect(() => tomato.associateCompanion(basil)).not.toThrow();
      expect(tomato.getCompanions()).toHaveLength(1);
    });
  });

  describe("associateCompanion - Invariant #7: Forbidden companions", () => {
    test("throws ForbiddenCompanionAssociation for forbidden relationships", () => {
      const registry = new MockCompanionRegistry();
      registry.addForbidden("tomato", "fennel");

      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const fennel = Crop.create(
        CropName.create("fennel"),
        HarvestPeriod.create(90, 120, 150),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );

      expect(() => tomato.associateCompanion(fennel)).toThrow(ForbiddenCompanionAssociation);
      expect(() => tomato.associateCompanion(fennel)).toThrow("incompatible companions");
    });

    test("allows association when not forbidden", () => {
      const registry = new MockCompanionRegistry();
      registry.addHelpful("tomato", "basil");

      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const basil = Crop.create(
        CropName.create("basil"),
        HarvestPeriod.create(50, 80, 100),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [Season.SUMMER]),
        registry,
      );

      expect(() => tomato.associateCompanion(basil)).not.toThrow();
    });
  });

  describe("associateCompanion - duplicate prevention", () => {
    test("does not add duplicate companions", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const basil = Crop.create(
        CropName.create("basil"),
        HarvestPeriod.create(50, 80, 100),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [Season.SUMMER]),
        registry,
      );

      tomato.associateCompanion(basil);
      tomato.associateCompanion(basil);

      expect(tomato.getCompanions()).toHaveLength(1);
    });
  });

  describe("canAssociateWith - query without side effects", () => {
    test("returns true for compatible crops", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const basil = Crop.create(
        CropName.create("basil"),
        HarvestPeriod.create(50, 80, 100),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.SHALLOW, [Season.SUMMER]),
        registry,
      );

      expect(tomato.canAssociateWith(basil)).toBe(true);
      expect(tomato.getCompanions()).toHaveLength(0); // No side effect
    });

    test("returns false for incompatible crops", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const lettuce = Crop.create(
        CropName.create("lettuce"),
        HarvestPeriod.create(30, 60, 70),
        GrowingRequirements.create(SunRequirement.PARTIAL_SHADE, RootDepth.SHALLOW, [Season.SPRING]),
        registry,
      );

      expect(tomato.canAssociateWith(lettuce)).toBe(false);
    });

    test("returns false for forbidden companions", () => {
      const registry = new MockCompanionRegistry();
      registry.addForbidden("tomato", "fennel");

      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );
      const fennel = Crop.create(
        CropName.create("fennel"),
        HarvestPeriod.create(90, 120, 150),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );

      expect(tomato.canAssociateWith(fennel)).toBe(false);
    });

    test("returns false for self-association", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(
        CropName.create("tomato"),
        HarvestPeriod.create(60, 120, 180),
        GrowingRequirements.create(SunRequirement.FULL_SUN, RootDepth.DEEP, [Season.SUMMER]),
        registry,
      );

      expect(tomato.canAssociateWith(tomato)).toBe(false);
    });
  });
});
