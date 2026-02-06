import type { Crop } from "@/crops/domain/aggregates/crop";
import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import type {
  CompanionNeighborState,
  PlantingLayoutResult,
} from "@/planting-intelligence/domain/services/plantingLayoutResult";
import {
  createBeneficialState,
  createIncompatibleState,
  createNeutralState,
} from "@/planting-intelligence/domain/value-objects/companionState";

export interface PlantingStrategy {
  planLinearLayout(crops: Crop[], registry: CompanionRegistry, totalSlots: number): PlantingLayoutResult;
}

class PlantingLayout implements PlantingLayoutResult {
  private readonly cropsInOrder: Crop[];
  private readonly neighborStates: CompanionNeighborState[];
  private readonly unplacedCrops: Crop[];

  constructor(cropsInOrder: Crop[], neighborStates: CompanionNeighborState[], unplacedCrops: Crop[]) {
    this.cropsInOrder = cropsInOrder;
    this.neighborStates = neighborStates;
    this.unplacedCrops = unplacedCrops;
  }

  getCropsInOrder(): Crop[] {
    return this.cropsInOrder;
  }

  getNeighborStates(): CompanionNeighborState[] {
    return this.neighborStates;
  }

  getUnplacedCrops(): Crop[] {
    return this.unplacedCrops;
  }
}

export class GreedyPlantingStrategy implements PlantingStrategy {
  planLinearLayout(crops: Crop[], registry: CompanionRegistry, totalSlots: number): PlantingLayoutResult {
    if (crops.length === 0 || totalSlots <= 0) {
      return new PlantingLayout([], [], []);
    }

    const placed: Crop[] = [];

    while (placed.length < totalSlots) {
      const remaining: Crop[] = [...crops];

      if (placed.length === 0) {
        const first = remaining.shift();
        if (first === undefined) break;
        placed.push(first);
      }

      while (remaining.length > 0 && placed.length < totalSlots) {
        const lastPlaced = placed[placed.length - 1] as Crop;

        let bestBeneficialIndex = -1;
        let bestNeutralIndex = -1;
        let fallbackIndex = -1;

        for (let index = 0; index < remaining.length; index += 1) {
          const candidate = remaining[index] as Crop;

          if (!lastPlaced.canAssociateWith(candidate)) {
            if (fallbackIndex === -1) fallbackIndex = index;
            continue;
          }

          if (this.isBeneficial(lastPlaced, candidate, registry)) {
            bestBeneficialIndex = index;
            break;
          }

          if (bestNeutralIndex === -1) bestNeutralIndex = index;
        }

        const nextIndex =
          bestBeneficialIndex !== -1 ? bestBeneficialIndex : bestNeutralIndex !== -1 ? bestNeutralIndex : fallbackIndex;

        if (nextIndex === -1) break;

        const [next] = remaining.splice(nextIndex, 1) as [Crop];
        placed.push(next);
      }
    }

    const neighborStates = this.computeNeighborStates(placed, registry);

    return new PlantingLayout(placed, neighborStates, []);
  }

  private isBeneficial(left: Crop, right: Crop, registry: CompanionRegistry): boolean {
    const leftName = left.getName();
    const rightName = right.getName();
    return registry.isHelpful(leftName, rightName) || registry.isHelpful(rightName, leftName);
  }

  private classifyPair(left: Crop, right: Crop, registry: CompanionRegistry) {
    if (!left.canAssociateWith(right)) {
      return createIncompatibleState();
    }

    if (this.isBeneficial(left, right, registry)) {
      return createBeneficialState();
    }

    return createNeutralState();
  }

  private computeNeighborStates(crops: Crop[], registry: CompanionRegistry): CompanionNeighborState[] {
    const states: CompanionNeighborState[] = [];

    for (let index = 0; index < crops.length - 1; index += 1) {
      const left = crops[index] as Crop;
      const right = crops[index + 1] as Crop;
      const state = this.classifyPair(left, right, registry);

      states.push({
        leftIndex: index,
        rightIndex: index + 1,
        state,
      });
    }

    return states;
  }
}
