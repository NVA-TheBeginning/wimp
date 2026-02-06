export abstract class GardenDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidGardenArea extends GardenDomainError {}

export class InvalidPlantId extends GardenDomainError {}

export class InvalidPlantSelection extends GardenDomainError {}

export class GardenCapacityExceeded extends GardenDomainError {}

export class IncompatibleSelectedPlants extends GardenDomainError {}
