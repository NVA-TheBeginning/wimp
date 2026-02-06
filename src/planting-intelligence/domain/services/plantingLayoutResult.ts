import type { Crop } from "@/crops/domain/aggregates/crop";
import type { CompanionState } from "@/planting-intelligence/domain/value-objects/companionState";

export interface CompanionNeighborState {
  readonly leftIndex: number;
  readonly rightIndex: number;
  readonly state: CompanionState;
}

export interface PlantingLayoutResult {
  getCropsInOrder(): Crop[];
  getNeighborStates(): CompanionNeighborState[];
  getUnplacedCrops(): Crop[];
}
