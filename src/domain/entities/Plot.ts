import type { PlotData } from "../schemas/schemas";
import { Position } from "../value-objects/Position";
import { Plant } from "./Plant";

export class Plot {
  readonly position: Position;
  private _soilMoisture: number;
  private _plant: Plant | null;

  private constructor(position: Position, soilMoisture: number, plant: Plant | null) {
    this.position = position;
    this._soilMoisture = soilMoisture;
    this._plant = plant;
  }

  static create(x: number, y: number): Plot {
    return new Plot(Position.create(x, y), 50, null);
  }

  static fromData(data: PlotData): Plot {
    const position = Position.fromData(data.position);
    const plant = data.plant ? Plant.fromData(data.plant) : null;
    return new Plot(position, data.soilMoisture, plant);
  }

  get soilMoisture(): number {
    return this._soilMoisture;
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

  water(amount = 30): void {
    this._soilMoisture = Math.min(100, this._soilMoisture + amount);
  }

  removePlant(): Plant | null {
    const plant = this._plant;
    this._plant = null;
    return plant;
  }

  advanceDay(growthModifier = 1): void {
    this._soilMoisture = Math.max(0, this._soilMoisture - 5);
    if (this._plant) {
      const moistureBonus = this._soilMoisture > 30 ? 1 : 0.5;
      this._plant.grow(growthModifier * moistureBonus);

      if (this._soilMoisture < 20) {
        this._plant.applyHealthModifier(-5);
      }
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
      soilMoisture: this._soilMoisture,
      plant: this._plant?.toData() ?? null,
    };
  }
}
