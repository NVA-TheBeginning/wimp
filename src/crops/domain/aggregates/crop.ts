import { CompanionAssociated } from "@/crops/domain/events/companionAssociated";
import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import { CompanionAssociationSpecification } from "@/crops/domain/specifications/companionAssociationSpecification";
import type { CropName } from "@/crops/domain/value-objects/cropName";
import type { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";
import { AggregateRoot } from "@/shared/domain/aggregateRoot";

export class Crop extends AggregateRoot {
  private readonly name: CropName;
  private readonly harvestPeriod: HarvestPeriod;
  private readonly companionRegistry: CompanionRegistry;
  private readonly companions: Set<CropName>;

  private constructor(name: CropName, harvestPeriod: HarvestPeriod, companionRegistry: CompanionRegistry) {
    super();
    this.name = name;
    this.harvestPeriod = harvestPeriod;
    this.companionRegistry = companionRegistry;
    this.companions = new Set();
  }

  static create(name: CropName, harvestPeriod: HarvestPeriod, companionRegistry: CompanionRegistry): Crop {
    return new Crop(name, harvestPeriod, companionRegistry);
  }

  associateCompanion(companion: Crop): void {
    const spec = new CompanionAssociationSpecification(this.companionRegistry);
    spec.isSatisfiedBy({ crop: this, companion });

    this.companions.add(companion.name);
    this.addDomainEvent(new CompanionAssociated(this.name.getValue(), companion.name.getValue()));
  }

  canAssociateWith(companion: Crop): boolean {
    try {
      const spec = new CompanionAssociationSpecification(this.companionRegistry);
      spec.isSatisfiedBy({ crop: this, companion });
      return true;
    } catch (_error) {
      return false;
    }
  }

  getName(): CropName {
    return this.name;
  }

  getHarvestPeriod(): HarvestPeriod {
    return this.harvestPeriod;
  }

  getCompanions(): CropName[] {
    return Array.from(this.companions);
  }
}
