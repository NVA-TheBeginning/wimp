import { InvalidGardenArea } from "@/garden/domain/errors/errors";

export class GardenArea {
  private readonly areaM2: number;

  private constructor(areaM2: number) {
    this.areaM2 = areaM2;
  }

  static create(areaM2: number): GardenArea {
    if (!Number.isFinite(areaM2)) {
      throw new InvalidGardenArea("Garden area must be a finite number");
    }

    if (areaM2 < 1) {
      throw new InvalidGardenArea("Garden area must be at least 1 m2");
    }

    return new GardenArea(areaM2);
  }

  getAreaM2(): number {
    return this.areaM2;
  }

  getSideLengthMeters(): number {
    return Math.sqrt(this.areaM2);
  }

  getPlantCapacity(): number {
    return Math.max(1, Math.floor(this.areaM2));
  }
}
