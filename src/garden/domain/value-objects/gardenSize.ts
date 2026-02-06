import { InvalidGardenSize } from "@/garden/domain/exceptions/errors";

const GARDEN_SIZES = ["SMALL", "MEDIUM", "LARGE"] as const;
type GardenSizeValue = (typeof GARDEN_SIZES)[number];

const SIZE_DIMENSIONS: Record<GardenSizeValue, number> = {
  SMALL: 7,
  MEDIUM: 15,
  LARGE: 30,
};

export class GardenSize {
  private readonly value: GardenSizeValue;

  private constructor(value: GardenSizeValue) {
    this.value = value;
  }

  static create(value: string): GardenSize {
    if (!GARDEN_SIZES.includes(value as GardenSizeValue)) {
      throw new InvalidGardenSize(value);
    }
    return new GardenSize(value as GardenSizeValue);
  }

  getValue(): GardenSizeValue {
    return this.value;
  }

  getDimension(): number {
    return SIZE_DIMENSIONS[this.value];
  }

  equals(other: GardenSize): boolean {
    return this.value === other.value;
  }
}

export { GARDEN_SIZES };
