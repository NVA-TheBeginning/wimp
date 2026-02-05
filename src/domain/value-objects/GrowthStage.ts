import type { GrowthStage as GrowthStageType } from "../schemas/schemas";

const STAGE_ORDER: GrowthStageType[] = ["SEED", "SPROUT", "GROWING", "MATURE", "HARVESTABLE"];

export class GrowthStage {
  readonly value: GrowthStageType;

  private constructor(value: GrowthStageType) {
    this.value = value;
  }

  static create(value: GrowthStageType): GrowthStage {
    return new GrowthStage(value);
  }

  static seed(): GrowthStage {
    return new GrowthStage("SEED");
  }

  next(): GrowthStage | null {
    const idx = STAGE_ORDER.indexOf(this.value);
    if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
    const nextStage = STAGE_ORDER[idx + 1];
    if (!nextStage) return null;
    return new GrowthStage(nextStage);
  }

  isHarvestable(): boolean {
    return this.value === "HARVESTABLE";
  }

  isMature(): boolean {
    return this.value === "MATURE" || this.value === "HARVESTABLE";
  }

  ordinal(): number {
    return STAGE_ORDER.indexOf(this.value);
  }

  equals(other: GrowthStage): boolean {
    return this.value === other.value;
  }
}
