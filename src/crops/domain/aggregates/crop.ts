import {
  CannotAssociateCropToItself,
  ForbiddenCompanionAssociation,
  IncompatibleGrowingRequirements,
} from "@/crops/domain/exceptions/errors";
import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import type { CropName } from "@/crops/domain/value-objects/cropName";
import type { GrowingRequirements } from "@/crops/domain/value-objects/growingRequirements";
import type { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";

export class Crop {
  private readonly name: CropName;
  private readonly harvestPeriod: HarvestPeriod;
  private readonly requirements: GrowingRequirements;
  private readonly companionRegistry: CompanionRegistry;
  private readonly companions: Set<CropName>;

  private constructor(
    name: CropName,
    harvestPeriod: HarvestPeriod,
    requirements: GrowingRequirements,
    companionRegistry: CompanionRegistry,
  ) {
    this.name = name;
    this.harvestPeriod = harvestPeriod;
    this.requirements = requirements;
    this.companionRegistry = companionRegistry;
    this.companions = new Set();
  }

  static create(
    name: CropName,
    harvestPeriod: HarvestPeriod,
    requirements: GrowingRequirements,
    companionRegistry: CompanionRegistry,
  ): Crop {
    return new Crop(name, harvestPeriod, requirements, companionRegistry);
  }

  associateCompanion(companion: Crop): void {
    if (this.name.equals(companion.name)) {
      throw new CannotAssociateCropToItself(this.name);
    }

    // Growing requirements compatibility (sun + season)
    if (!this.requirements.isCompatibleWith(companion.requirements)) {
      throw new IncompatibleGrowingRequirements(
        this.name,
        companion.name,
        "incompatible growing requirements (sun or season mismatch)",
      );
    }

    if (this.companionRegistry.isForbidden(this.name, companion.name)) {
      throw new ForbiddenCompanionAssociation(this.name, companion.name);
    }

    this.companions.add(companion.name);
  }

  canAssociateWith(companion: Crop): boolean {
    if (this.name.equals(companion.name)) return false;
    if (!this.requirements.isCompatibleWith(companion.requirements)) return false;
    if (this.companionRegistry.isForbidden(this.name, companion.name)) return false;

    return true;
  }

  getName(): CropName {
    return this.name;
  }

  getHarvestPeriod(): HarvestPeriod {
    return this.harvestPeriod;
  }

  getRequirements(): GrowingRequirements {
    return this.requirements;
  }

  getCompanions(): CropName[] {
    return Array.from(this.companions);
  }
}
