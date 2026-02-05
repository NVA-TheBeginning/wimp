import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import { NotForbiddenCompanionSpecification } from "@/crops/domain/specifications/notForbiddenCompanion";
import { NotSelfAssociationSpecification } from "@/crops/domain/specifications/notSelfAssociation";
import type { CompanionAssociationCandidate, Specification } from "@/crops/domain/specifications/specification";

export class CompanionAssociationSpecification implements Specification<CompanionAssociationCandidate> {
  private readonly specifications: Specification<CompanionAssociationCandidate>[];

  constructor(companionRegistry: CompanionRegistry) {
    this.specifications = [
      new NotSelfAssociationSpecification(),
      new NotForbiddenCompanionSpecification(companionRegistry),
    ];
  }

  isSatisfiedBy(candidate: CompanionAssociationCandidate): void {
    for (const spec of this.specifications) {
      spec.isSatisfiedBy(candidate);
    }
  }
}
