import type { DomainEvent } from "@/shared/domain/domainEvent";

export class CompanionAssociated implements DomainEvent {
  readonly eventName = "CompanionAssociated";
  readonly occurredOn: Date;
  readonly cropName: string;
  readonly companionName: string;

  constructor(cropName: string, companionName: string) {
    this.occurredOn = new Date();
    this.cropName = cropName;
    this.companionName = companionName;
  }
}
