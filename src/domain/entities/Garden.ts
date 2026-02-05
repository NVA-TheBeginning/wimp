import { type GardenData, type Season, SeasonSchema } from "../schemas/schemas";
import { Position } from "../value-objects/Position";
import { Plant } from "./Plant";
import { Plot } from "./Plot";

const GRID_SIZE = 5;
const DAYS_PER_SEASON = 30;

export interface CompanionResult {
  hasCompanion: boolean;
  hasIncompatible: boolean;
  companionNames: string[];
  incompatibleNames: string[];
}

export class Garden {
  private _plots: Map<string, Plot>;
  private _currentDay: number;
  private _season: Season;

  private constructor(plots: Map<string, Plot>, currentDay: number, season: Season) {
    this._plots = plots;
    this._currentDay = currentDay;
    this._season = season;
  }

  static create(): Garden {
    const plots = new Map<string, Plot>();
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const plot = Plot.create(x, y);
        plots.set(plot.position.toKey(), plot);
      }
    }
    return new Garden(plots, 1, "SPRING");
  }

  static fromData(data: GardenData): Garden {
    const plots = new Map<string, Plot>();
    for (const plotData of data.plots) {
      const plot = Plot.fromData(plotData);
      plots.set(plot.position.toKey(), plot);
    }
    return new Garden(plots, data.currentDay, data.season);
  }

  get currentDay(): number {
    return this._currentDay;
  }

  get season(): Season {
    return this._season;
  }

  get plots(): Plot[] {
    return Array.from(this._plots.values());
  }

  getPlot(x: number, y: number): Plot | undefined {
    return this._plots.get(`${x},${y}`);
  }

  getPlotByPosition(pos: Position): Plot | undefined {
    return this._plots.get(pos.toKey());
  }

  plantSeed(x: number, y: number, plantType: string): CompanionResult {
    const plot = this.getPlot(x, y);
    if (!plot) throw new Error("Invalid position");
    if (!plot.isEmpty()) throw new Error("Plot is not empty");

    const plant = Plant.create(plantType, this._currentDay);
    const companionResult = this.checkCompanions(Position.create(x, y), plant);

    plot.plantSeed(plant);
    return companionResult;
  }

  harvestPlant(x: number, y: number): Plant | null {
    const plot = this.getPlot(x, y);
    if (!plot) throw new Error("Invalid position");
    if (plot.isEmpty() || !plot.plant?.isHarvestable()) return null;
    return plot.removePlant();
  }

  checkCompanions(position: Position, plant: Plant): CompanionResult {
    const result: CompanionResult = {
      hasCompanion: false,
      hasIncompatible: false,
      companionNames: [],
      incompatibleNames: [],
    };

    for (const plot of this._plots.values()) {
      if (!plot.plant || plot.position.equals(position) || !plot.plant.isHarvestable()) continue;

      const otherType = plot.plant.type;

      if (plant.type.isCompanion(otherType)) {
        result.hasCompanion = true;
        if (!result.companionNames.includes(otherType.name)) {
          result.companionNames.push(otherType.name);
        }
      }

      if (plant.type.isIncompatible(otherType)) {
        result.hasIncompatible = true;
        if (!result.incompatibleNames.includes(otherType.name)) {
          result.incompatibleNames.push(otherType.name);
        }
      }
    }

    return result;
  }

  advanceDay(): void {
    this._currentDay++;

    if (this._currentDay % DAYS_PER_SEASON === 1 && this._currentDay > 1) {
      const currentIdx = SeasonSchema.options.indexOf(this._season);
      const nextSeason = SeasonSchema.options[(currentIdx + 1) % SeasonSchema.options.length];
      if (nextSeason) this._season = nextSeason;
    }

    const seasonModifier = this._season === "WINTER" ? 0.5 : this._season === "SUMMER" ? 1.2 : 1;

    for (const plot of this._plots.values()) {
      if (plot.plant) {
        const position = plot.position;
        const companionResult = this.checkCompanions(position, plot.plant);

        let growthModifier = seasonModifier;
        if (companionResult.hasCompanion) growthModifier *= 1.2;
        if (companionResult.hasIncompatible) {
          growthModifier *= 0.7;
          plot.plant.applyHealthModifier(-3);
        }

        plot.advanceDay(growthModifier);
      } else {
        plot.advanceDay();
      }
    }
  }

  toData(): GardenData {
    return {
      plots: this.plots.map((p) => p.toData()),
      currentDay: this._currentDay,
      season: this._season,
    };
  }
}
