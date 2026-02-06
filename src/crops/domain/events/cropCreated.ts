import type { DomainEvent } from "@/shared/domain/domainEvent";

export class CropCreated implements DomainEvent {
  readonly eventName = "CropCreated";
  readonly occurredOn: Date;
  readonly cropName: string;

  constructor(cropName: string) {
    this.occurredOn = new Date();
    this.cropName = cropName;
  }
}
