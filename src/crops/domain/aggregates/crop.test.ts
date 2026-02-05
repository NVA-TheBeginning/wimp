import { describe, expect, test } from "bun:test";
import { Crop } from "@/crops/domain/aggregates/crop";
import { CannotAssociateCropToItself, ForbiddenCompanionAssociation } from "@/crops/domain/exceptions/errors";
import { CropName } from "@/crops/domain/value-objects/cropName";
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
      const crop = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);

      expect(crop.getName().getValue()).toBe("tomato");
      expect(crop.getCompanions()).toHaveLength(0);
    });
  });

  describe("associateCompanion - Invariant #3: No self-companion", () => {
    test("throws CannotAssociateCropToItself when associating with itself", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);

      expect(() => tomato.associateCompanion(tomato)).toThrow(CannotAssociateCropToItself);
      expect(() => tomato.associateCompanion(tomato)).toThrow("cannot be associated with itself");
    });
  });

  describe("associateCompanion - Invariant #7: Forbidden companions", () => {
    test("throws ForbiddenCompanionAssociation for forbidden relationships", () => {
      const registry = new MockCompanionRegistry();
      registry.addForbidden("tomato", "fennel");

      const tomato = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);
      const fennel = Crop.create(CropName.create("fennel"), HarvestPeriod.create(90, 120, 150), registry);

      expect(() => tomato.associateCompanion(fennel)).toThrow(ForbiddenCompanionAssociation);
      expect(() => tomato.associateCompanion(fennel)).toThrow("incompatible companions");
    });

    test("allows association when not forbidden", () => {
      const registry = new MockCompanionRegistry();
      registry.addHelpful("tomato", "basil");

      const tomato = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);
      const basil = Crop.create(CropName.create("basil"), HarvestPeriod.create(50, 80, 100), registry);

      expect(() => tomato.associateCompanion(basil)).not.toThrow();
    });
  });

  describe("associateCompanion - duplicate prevention", () => {
    test("does not add duplicate companions", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);
      const basil = Crop.create(CropName.create("basil"), HarvestPeriod.create(50, 80, 100), registry);

      tomato.associateCompanion(basil);
      tomato.associateCompanion(basil);

      expect(tomato.getCompanions()).toHaveLength(1);
    });
  });

  describe("canAssociateWith", () => {
    test("returns true for compatible crops", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);
      const basil = Crop.create(CropName.create("basil"), HarvestPeriod.create(50, 80, 100), registry);

      expect(() => tomato.canAssociateWith(basil)).not.toThrow();
      expect(tomato.canAssociateWith(basil)).toBe(true);
    });

    test("returns false for forbidden companions", () => {
      const registry = new MockCompanionRegistry();
      registry.addForbidden("tomato", "fennel");

      const tomato = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);
      const fennel = Crop.create(CropName.create("fennel"), HarvestPeriod.create(90, 120, 150), registry);

      expect(tomato.canAssociateWith(fennel)).toBe(false);
    });

    test("returns false for self-association", () => {
      const registry = new MockCompanionRegistry();
      const tomato = Crop.create(CropName.create("tomato"), HarvestPeriod.create(60, 120, 180), registry);

      expect(tomato.canAssociateWith(tomato)).toBe(false);
    });
  });
});
