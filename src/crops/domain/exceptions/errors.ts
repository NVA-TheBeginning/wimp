import type { CropName } from "@/crops/domain/value-objects/cropName";

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class IncompatibleCropError extends DomainError {
  constructor(crop1: CropName, crop2: CropName, reason: string) {
    super(`Cannot associate ${crop1.getValue()} with ${crop2.getValue()}: ${reason}`);
  }
}

export class SelfAssociationError extends DomainError {
  constructor(cropName: CropName) {
    super(`Crop ${cropName.getValue()} cannot be associated with itself`);
  }
}

export class ForbiddenCompanionError extends DomainError {
  constructor(crop1: CropName, crop2: CropName) {
    super(`${crop1.getValue()} and ${crop2.getValue()} are incompatible companions (forbidden relationship)`);
  }
}

export class InvalidCropNameError extends DomainError {}

export class InvalidHarvestPeriodError extends DomainError {}

export class InvalidGrowingRequirementsError extends DomainError {}
