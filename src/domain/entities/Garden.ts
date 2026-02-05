import type { GardenSize } from "../schemas/schemas";

export class Garden {
  size: GardenSize;

  private constructor(size: GardenSize) {
    this.size = size;
  }

  static create(size: GardenSize): Garden {
    return new Garden(size);
  }
}
