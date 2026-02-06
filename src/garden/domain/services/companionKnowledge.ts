import type { PlantId } from "@/garden/domain/value-objects/plantId";

export interface CompanionKnowledge {
  getCompanionCandidates(plantId: PlantId): PlantId[];
  isForbiddenPair(first: PlantId, second: PlantId): boolean;
  getCompatibilityScore(first: PlantId, second: PlantId): number;
}
