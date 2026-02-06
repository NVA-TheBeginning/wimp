import { InvalidPlantId } from "@/planting-intelligence/domain/errors/errors";

const PLANT_ID_REGEX = /^[a-z0-9][a-z0-9-_]*$/;

export class PlantId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(rawValue: string): PlantId {
    const normalized = rawValue.trim().toLowerCase();

    if (normalized.length === 0) {
      throw new InvalidPlantId("Plant id cannot be empty");
    }

    if (normalized.length > 160) {
      throw new InvalidPlantId("Plant id cannot exceed 160 characters");
    }

    if (!PLANT_ID_REGEX.test(normalized)) {
      throw new InvalidPlantId(`Plant id "${rawValue}" has invalid characters`);
    }

    return new PlantId(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PlantId): boolean {
    return this.value === other.value;
  }
}
