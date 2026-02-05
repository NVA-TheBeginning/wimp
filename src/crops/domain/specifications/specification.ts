import type { Crop } from "@/crops/domain/aggregates/crop";

export interface CompanionAssociationCandidate {
  crop: Crop;
  companion: Crop;
}

export interface Specification<T> {
  isSatisfiedBy(candidate: T): void;
}
