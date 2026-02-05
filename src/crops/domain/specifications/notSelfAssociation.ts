import { CannotAssociateCropToItself } from "@/crops/domain/exceptions/errors";
import type { CompanionAssociationCandidate, Specification } from "@/crops/domain/specifications/specification";

export class NotSelfAssociationSpecification implements Specification<CompanionAssociationCandidate> {
  isSatisfiedBy(candidate: CompanionAssociationCandidate): void {
    if (candidate.crop.getName().equals(candidate.companion.getName())) {
      throw new CannotAssociateCropToItself(candidate.crop.getName());
    }
  }
}
