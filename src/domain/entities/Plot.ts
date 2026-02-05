import type { PlotData } from "../schemas/schemas";
import { Position } from "../value-objects/Position";
import { Plant } from "./Plant";

export class Plot {
  readonly position: Position;
  private _plant: Plant | null;

  private constructor(position: Position, plant: Plant | null) {
    this.position = position;
    this._plant = plant;
  }

  static create(x: number, y: number): Plot {
    return new Plot(Position.create(x, y), null);
  }

  static fromData(data: PlotData): Plot {
    const position = Position.fromData(data.position);
    const plant = data.plant ? Plant.fromData(data.plant) : null;
    return new Plot(position, plant);
  }

  get plant(): Plant | null {
    return this._plant;
  }

  isEmpty(): boolean {
    return this._plant === null;
  }

  hasPlant(): boolean {
    return this._plant !== null;
  }

  plantSeed(plant: Plant): void {
    if (this._plant) throw new Error("Plot already has a plant");
    this._plant = plant;
  }

  removePlant(): Plant | null {
    const plant = this._plant;
    this._plant = null;
    return plant;
  }

  advanceDay(growthModifier = 1): void {
    if (this._plant) {
      this._plant.grow(growthModifier);
    }
  }

  getDisplayEmoji(): string {
    if (!this._plant) return "⬜";
    if (this._plant.isDead()) return "💀";
    return this._plant.getEmoji();
  }

  toData(): PlotData {
    return {
      position: this.position.toData(),
      plant: this._plant?.toData() ?? null,
    };
  }
}
