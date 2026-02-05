import { InvalidCropName } from "@/crops/domain/exceptions/errors";

export class CropName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(name: string): CropName {
    const normalized = name.trim().toLowerCase();

    if (normalized.length === 0) {
      throw new InvalidCropName("Crop name cannot be empty");
    }

    if (normalized.length > 100) {
      throw new InvalidCropName("Crop name cannot exceed 100 characters");
    }

    return new CropName(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CropName): boolean {
    return this.value === other.value;
  }
}
