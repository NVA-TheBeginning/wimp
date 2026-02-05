import { InvalidGrowingRequirementsError } from "@/crops/domain/exceptions/errors";

export enum SunRequirement {
  FULL_SUN = "FULL_SUN",
  PARTIAL_SHADE = "PARTIAL_SHADE",
  FULL_SHADE = "FULL_SHADE",
}

export enum RootDepth {
  SHALLOW = "SHALLOW",
  MEDIUM = "MEDIUM",
  DEEP = "DEEP",
}

export enum Season {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
  WINTER = "WINTER",
}

export class GrowingRequirements {
  private readonly sunRequirement: SunRequirement;
  private readonly rootDepth: RootDepth;
  private readonly seasons: ReadonlyArray<Season>;

  private constructor(sunRequirement: SunRequirement, rootDepth: RootDepth, seasons: Season[]) {
    this.sunRequirement = sunRequirement;
    this.rootDepth = rootDepth;
    this.seasons = [...seasons];
  }

  static create(sunRequirement: SunRequirement, rootDepth: RootDepth, seasons: Season[]): GrowingRequirements {
    if (seasons.length === 0) {
      throw new InvalidGrowingRequirementsError("At least one season is required");
    }

    return new GrowingRequirements(sunRequirement, rootDepth, seasons);
  }

  getSunRequirement(): SunRequirement {
    return this.sunRequirement;
  }

  getRootDepth(): RootDepth {
    return this.rootDepth;
  }

  getSeasons(): ReadonlyArray<Season> {
    return this.seasons;
  }

  isCompatibleWith(other: GrowingRequirements): boolean {
    if (this.sunRequirement !== other.sunRequirement) return false;

    const hasSeasonOverlap = this.seasons.some((season) => other.seasons.includes(season));
    if (!hasSeasonOverlap) return false;

    return true;
  }
}
