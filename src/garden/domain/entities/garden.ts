import type { Crop } from "@/crops/domain/aggregates/crop";
import { GardenCreated } from "@/garden/domain/events/gardenCreated";
import { GardenPlanted } from "@/garden/domain/events/gardenPlanted";
import type { GardenSize } from "@/garden/domain/value-objects/gardenSize";
import { AggregateRoot } from "@/shared/domain/aggregateRoot";

export class Garden extends AggregateRoot {
  private readonly size: GardenSize;
  private readonly crops: Set<Crop>;
  private readonly field: Crop[] = [];

  private constructor(size: GardenSize) {
    super();
    this.size = size;
    this.crops = new Set();
  }

  static create(size: GardenSize): Garden {
    const garden = new Garden(size);
    garden.addDomainEvent(new GardenCreated(size.getValue()));
    return garden;
  }

  static reconstitute(size: GardenSize, existingField: Crop[]): Garden {
    const garden = new Garden(size);
    garden.restoreField(existingField);
    return garden;
  }

  private restoreField(crops: Crop[]): void {
    for (const crop of crops) {
      this.crops.add(crop);
      this.field.push(crop);
    }
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
    this.addDomainEvent(new GardenPlanted(crops.length));
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
