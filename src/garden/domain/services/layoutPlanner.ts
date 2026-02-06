import type { PlantAllocation, PositionedPlant } from "@/garden/domain/aggregates/plantingPlan";
import type { CompanionKnowledge } from "@/garden/domain/services/companionKnowledge";
import type { GardenArea } from "@/garden/domain/value-objects/gardenArea";
import type { PlantId } from "@/garden/domain/value-objects/plantId";

export interface LayoutPlanResult {
  positions: PositionedPlant[];
  gridSide: number;
  cellSizeMeters: number;
}

export class LayoutPlanner {
  private readonly knowledge: CompanionKnowledge;

  constructor(knowledge: CompanionKnowledge) {
    this.knowledge = knowledge;
  }

  plan(allocations: PlantAllocation[], area: GardenArea): LayoutPlanResult {
    const totalPlants = allocations.reduce((sum, allocation) => sum + allocation.quantity, 0);
    if (totalPlants <= 0) {
      return {
        positions: [],
        gridSide: 0,
        cellSizeMeters: 0,
      };
    }

    const sideLength = area.getSideLengthMeters();
    const gridSide = Math.ceil(Math.sqrt(totalPlants));
    const cellSizeMeters = sideLength / gridSide;
    const remaining = new Map<string, { plantId: PlantId; quantity: number }>();

    for (const allocation of allocations) {
      remaining.set(allocation.plantId.getValue(), {
        plantId: allocation.plantId,
        quantity: allocation.quantity,
      });
    }

    const occupied = new Map<number, PlantId>();
    const positions: PositionedPlant[] = [];

    for (let index = 0; index < totalPlants; index += 1) {
      const gridY = Math.floor(index / gridSide);
      const gridX = index % gridSide;
      const neighbors = this.getPlacedNeighbors(index, gridSide, occupied);
      const chosen = this.pickBestPlantForPosition(remaining, neighbors);

      occupied.set(index, chosen);
      this.decrement(remaining, chosen);

      positions.push({
        plantId: chosen,
        gridX,
        gridY,
        x: (gridX + 0.5) * cellSizeMeters,
        y: (gridY + 0.5) * cellSizeMeters,
      });
    }

    return {
      positions,
      gridSide,
      cellSizeMeters,
    };
  }

  private getPlacedNeighbors(index: number, gridSide: number, occupied: Map<number, PlantId>): PlantId[] {
    const neighbors: PlantId[] = [];
    const leftIndex = index - 1;
    const upIndex = index - gridSide;

    if (leftIndex >= 0 && leftIndex % gridSide !== gridSide - 1) {
      const left = occupied.get(leftIndex);
      if (left) neighbors.push(left);
    }

    if (upIndex >= 0) {
      const up = occupied.get(upIndex);
      if (up) neighbors.push(up);
    }

    return neighbors;
  }

  private pickBestPlantForPosition(remaining: Map<string, { plantId: PlantId; quantity: number }>, neighbors: PlantId[]): PlantId {
    let bestPlant: PlantId | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of remaining.values()) {
      if (candidate.quantity <= 0) continue;

      let score = candidate.quantity * 0.01;
      for (const neighbor of neighbors) {
        score += this.knowledge.getCompatibilityScore(candidate.plantId, neighbor);
      }

      if (!bestPlant || score > bestScore) {
        bestPlant = candidate.plantId;
        bestScore = score;
        continue;
      }

      if (score === bestScore && candidate.plantId.getValue().localeCompare(bestPlant.getValue()) < 0) {
        bestPlant = candidate.plantId;
      }
    }

    if (!bestPlant) {
      throw new Error("Unable to place plant: no remaining allocation");
    }

    return bestPlant;
  }

  private decrement(remaining: Map<string, { plantId: PlantId; quantity: number }>, plantId: PlantId): void {
    const key = plantId.getValue();
    const current = remaining.get(key);
    if (!current) return;

    current.quantity -= 1;
    if (current.quantity <= 0) {
      remaining.delete(key);
    }
  }
}
