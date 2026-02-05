import { InvalidHarvestPeriodError } from "@/crops/domain/exceptions/errors";

export class HarvestPeriod {
  private readonly firstHarvestDay: number;
  private readonly lastHarvestDay: number;
  private readonly lifespan: number;

  private constructor(firstHarvestDay: number, lastHarvestDay: number, lifespan: number) {
    this.firstHarvestDay = firstHarvestDay;
    this.lastHarvestDay = lastHarvestDay;
    this.lifespan = lifespan;
  }

  static create(firstHarvestDay: number, lastHarvestDay: number, lifespan: number): HarvestPeriod {
    if (firstHarvestDay < 0 || lastHarvestDay < 0 || lifespan < 0) {
      throw new InvalidHarvestPeriodError("Days must be non-negative");
    }

    if (firstHarvestDay > lastHarvestDay) {
      throw new InvalidHarvestPeriodError(
        `First harvest day (${firstHarvestDay}) must be less than or equal to last harvest day (${lastHarvestDay})`,
      );
    }

    if (lastHarvestDay > lifespan) {
      throw new InvalidHarvestPeriodError(`Last harvest day (${lastHarvestDay}) cannot exceed lifespan (${lifespan})`);
    }

    return new HarvestPeriod(firstHarvestDay, lastHarvestDay, lifespan);
  }

  getFirstHarvestDay(): number {
    return this.firstHarvestDay;
  }

  getLastHarvestDay(): number {
    return this.lastHarvestDay;
  }

  getLifespan(): number {
    return this.lifespan;
  }

  overlaps(other: HarvestPeriod): boolean {
    return this.firstHarvestDay <= other.lastHarvestDay && other.firstHarvestDay <= this.lastHarvestDay;
  }
}
