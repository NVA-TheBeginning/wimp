import type { DomainEvent } from "@/shared/domain/domainEvent";

export class GardenCreated implements DomainEvent {
  readonly eventName = "GardenCreated";
  readonly occurredOn: Date;
  readonly sizeValue: string;

  constructor(sizeValue: string) {
    this.occurredOn = new Date();
    this.sizeValue = sizeValue;
  }
}
