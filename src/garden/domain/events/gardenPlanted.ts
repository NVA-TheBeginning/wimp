import type { DomainEvent } from "@/shared/domain/domainEvent";

export class GardenPlanted implements DomainEvent {
  readonly eventName = "GardenPlanted";
  readonly occurredOn: Date;
  readonly totalCropsPlaced: number;

  constructor(totalCropsPlaced: number) {
    this.occurredOn = new Date();
    this.totalCropsPlaced = totalCropsPlaced;
  }
}
