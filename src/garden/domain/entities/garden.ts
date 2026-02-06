import type { GardenArea } from "@/garden/domain/value-objects/gardenArea";

export class Garden {
  area: GardenArea;

  private constructor(area: GardenArea) {
    this.area = area;
  }

  static create(area: GardenArea): Garden {
    return new Garden(area);
  }
}
