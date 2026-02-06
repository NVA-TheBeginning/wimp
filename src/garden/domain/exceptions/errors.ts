export abstract class GardenDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidGardenSize extends GardenDomainError {
  constructor(value: string) {
    super(`Invalid garden size: "${value}". Must be SMALL, MEDIUM, or LARGE.`);
  }
}
