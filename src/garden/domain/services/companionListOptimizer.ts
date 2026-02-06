import type { PlantAllocation, PlantAllocationSource } from "@/garden/domain/aggregates/plantingPlan";
import {
  GardenCapacityExceeded,
  IncompatibleSelectedPlants,
  InvalidPlantSelection,
} from "@/garden/domain/errors/errors";
import type { CompanionKnowledge } from "@/garden/domain/services/companionKnowledge";
import type { GardenArea } from "@/garden/domain/value-objects/gardenArea";
import type { PlantId } from "@/garden/domain/value-objects/plantId";

interface CandidateScore {
  plantId: PlantId;
  score: number;
}

interface WorkingAllocation {
  plantId: PlantId;
  source: PlantAllocationSource;
  quantity: number;
  score: number;
}

export class CompanionListOptimizer {
  private readonly knowledge: CompanionKnowledge;

  constructor(knowledge: CompanionKnowledge) {
    this.knowledge = knowledge;
  }

  optimize(selectedPlants: PlantId[], area: GardenArea): PlantAllocation[] {
    const selected = this.deduplicate(selectedPlants);

    if (selected.length < 1) {
      throw new InvalidPlantSelection("You must choose at least 1 plant");
    }

    const capacity = area.getPlantCapacity();
    if (selected.length > capacity) {
      throw new GardenCapacityExceeded(
        `Garden capacity (${capacity}) is too small for ${selected.length} selected plants`,
      );
    }

    this.ensureNoForbiddenPairs(selected);

    const working = new Map<string, WorkingAllocation>();
    for (const plant of selected) {
      working.set(plant.getValue(), {
        plantId: plant,
        source: "selected",
        quantity: 1,
        score: 100,
      });
    }

    const companionLimit = Math.min(capacity - selected.length, selected.length * 2);
    const candidates = this.rankCompanionCandidates(selected, working);

    for (const candidate of candidates.slice(0, companionLimit)) {
      working.set(candidate.plantId.getValue(), {
        plantId: candidate.plantId,
        source: "companion",
        quantity: 1,
        score: candidate.score,
      });
    }

    let remainingSlots = capacity - working.size;
    const workingList = Array.from(working.values());

    while (remainingSlots > 0) {
      const target = this.pickBestPlantForExtraSlot(workingList);
      target.quantity += 1;
      remainingSlots -= 1;
    }

    return workingList
      .sort((left, right) => {
        if (left.source !== right.source) {
          return left.source === "selected" ? -1 : 1;
        }
        if (left.quantity !== right.quantity) {
          return right.quantity - left.quantity;
        }
        return left.plantId.getValue().localeCompare(right.plantId.getValue());
      })
      .map((item) => ({
        plantId: item.plantId,
        quantity: item.quantity,
        source: item.source,
      }));
  }

  private deduplicate(items: PlantId[]): PlantId[] {
    const deduplicated = new Map<string, PlantId>();
    for (const item of items) {
      deduplicated.set(item.getValue(), item);
    }
    return Array.from(deduplicated.values());
  }

  private ensureNoForbiddenPairs(plants: PlantId[]): void {
    for (let i = 0; i < plants.length; i += 1) {
      const first = plants[i];
      if (!first) continue;

      for (let j = i + 1; j < plants.length; j += 1) {
        const second = plants[j];
        if (!second) continue;

        if (this.knowledge.isForbiddenPair(first, second)) {
          throw new IncompatibleSelectedPlants(
            `Selected plants are incompatible: ${first.getValue()} and ${second.getValue()}`,
          );
        }
      }
    }
  }

  private rankCompanionCandidates(
    selected: PlantId[],
    alreadyIncluded: Map<string, WorkingAllocation>,
  ): CandidateScore[] {
    const candidates = new Map<string, CandidateScore>();

    for (const selectedPlant of selected) {
      for (const candidate of this.knowledge.getCompanionCandidates(selectedPlant)) {
        const candidateId = candidate.getValue();
        if (alreadyIncluded.has(candidateId)) continue;

        let score = 1;
        let forbidden = false;

        for (const target of selected) {
          const compatibility = this.knowledge.getCompatibilityScore(candidate, target);
          if (compatibility < 0) {
            forbidden = true;
            break;
          }
          score += compatibility;
        }

        if (forbidden || score <= 1) continue;

        const existing = candidates.get(candidateId);
        if (!existing) {
          candidates.set(candidateId, { plantId: candidate, score });
          continue;
        }

        existing.score += score;
      }
    }

    return Array.from(candidates.values()).sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.plantId.getValue().localeCompare(right.plantId.getValue());
    });
  }

  private pickBestPlantForExtraSlot(candidates: WorkingAllocation[]): WorkingAllocation {
    let best: WorkingAllocation | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of candidates) {
      let score = candidate.score;
      if (candidate.source === "selected") {
        score += 2;
      }

      for (const other of candidates) {
        if (candidate.plantId.equals(other.plantId)) continue;
        const compatibility = this.knowledge.getCompatibilityScore(candidate.plantId, other.plantId);
        if (compatibility > 0) {
          score += compatibility;
        }
      }

      if (!best || score > bestScore) {
        best = candidate;
        bestScore = score;
        continue;
      }

      if (score === bestScore && candidate.plantId.getValue().localeCompare(best.plantId.getValue()) < 0) {
        best = candidate;
      }
    }

    if (!best) {
      throw new Error("Unable to allocate remaining plant slots");
    }

    return best;
  }
}
