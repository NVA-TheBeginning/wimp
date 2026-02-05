import { ForbiddenCompanionAssociation } from "@/crops/domain/exceptions/errors";
import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import type { CompanionAssociationCandidate, Specification } from "@/crops/domain/specifications/specification";

export class NotForbiddenCompanionSpecification implements Specification<CompanionAssociationCandidate> {
  private readonly companionRegistry: CompanionRegistry;

  constructor(companionRegistry: CompanionRegistry) {
    this.companionRegistry = companionRegistry;
  }

  isSatisfiedBy(candidate: CompanionAssociationCandidate): void {
    if (this.companionRegistry.isForbidden(candidate.crop.getName(), candidate.companion.getName())) {
      throw new ForbiddenCompanionAssociation(candidate.crop.getName(), candidate.companion.getName());
    }
  }
}
