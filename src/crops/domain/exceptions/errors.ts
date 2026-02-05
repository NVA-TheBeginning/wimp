import type { CropName } from "@/crops/domain/value-objects/cropName";

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class CannotAssociateCropToItself extends DomainError {
  constructor(cropName: CropName) {
    super(`Crop ${cropName.getValue()} cannot be associated with itself`);
  }
}

export class ForbiddenCompanionAssociation extends DomainError {
  constructor(crop1: CropName, crop2: CropName) {
    super(`${crop1.getValue()} and ${crop2.getValue()} are incompatible companions (forbidden relationship)`);
  }
}

export class InvalidCropName extends DomainError {}

export class InvalidHarvestPeriod extends DomainError {}
