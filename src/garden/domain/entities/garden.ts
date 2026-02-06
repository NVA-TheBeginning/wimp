import type { Crop } from "@/crops/domain/aggregates/crop";
import type { GardenSize } from "@/garden/domain/value-objects/gardenSize";

export class Garden {
  private readonly size: GardenSize;
  private readonly crops: Set<Crop>;
  private readonly field: Crop[] = [];

  private constructor(size: GardenSize) {
    this.size = size;
    this.crops = new Set();
  }

  static create(size: GardenSize): Garden {
    return new Garden(size);
  }

  addCrop(crop: Crop): void {
    this.crops.add(crop);
  }

  getCrops(): Crop[] {
    return Array.from(this.crops);
  }

  plantCrops(crops: Crop[]): void {
    this.field.length = 0;
    for (const crop of crops) {
      this.crops.add(crop);
      this.field.push(crop);
    }
  }

  getField(): Crop[] {
    return [...this.field];
  }

  getCropAt(row: number, col: number): Crop | undefined {
    const index = row * this.getDimension() + col;
    return this.field[index];
  }

  getSize(): GardenSize {
    return this.size;
  }

  getDimension(): number {
    return this.size.getDimension();
  }
}
