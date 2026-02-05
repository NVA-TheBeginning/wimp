import type { GrowthStage as GrowthStageType, PlantData } from "../schemas/schemas";
import { GrowthStage } from "../value-objects/GrowthStage";
import { PlantType } from "../value-objects/PlantType";

export class Plant {
  readonly id: string;
  readonly type: PlantType;
  readonly plantedDay: number;
  private _currentStage: GrowthStage;
  private _health: number;
  private _growthProgress: number;

  private constructor(
    id: string,
    type: PlantType,
    plantedDay: number,
    stage: GrowthStage,
    health: number,
    growthProgress: number,
  ) {
    this.id = id;
    this.type = type;
    this.plantedDay = plantedDay;
    this._currentStage = stage;
    this._health = health;
    this._growthProgress = growthProgress;
  }

  static create(typeName: string, plantedDay: number): Plant {
    const type = PlantType.fromName(typeName);
    const id = `${typeName}-${plantedDay}-${Math.random().toString(36).slice(2, 8)}`;
    return new Plant(id, type, plantedDay, GrowthStage.seed(), 100, 0);
  }

  static fromData(data: PlantData): Plant {
    const type = PlantType.fromName(data.type);
    const stage = GrowthStage.create(data.currentStage);
    return new Plant(data.id, type, data.plantedDay, stage, data.health, data.growthProgress);
  }

  get currentStage(): GrowthStage {
    return this._currentStage;
  }

  get health(): number {
    return this._health;
  }

  get growthProgress(): number {
    return this._growthProgress;
  }

  grow(growthModifier = 1): void {
    if (this._currentStage.isHarvestable()) return;

    const baseGrowth = 100 / this.type.daysToHarvest;
    this._growthProgress += baseGrowth * growthModifier;

    const stageThresholds = [0, 10, 40, 70, 100];
    const currentOrdinal = this._currentStage.ordinal();

    for (let i = currentOrdinal + 1; i < stageThresholds.length; i++) {
      const threshold = stageThresholds[i];
      if (threshold !== undefined && this._growthProgress >= threshold) {
        const next = this._currentStage.next();
        if (next) this._currentStage = next;
      }
    }
  }

  applyHealthModifier(modifier: number): void {
    this._health = Math.max(0, Math.min(100, this._health + modifier));
  }

  isHarvestable(): boolean {
    return this._currentStage.isHarvestable();
  }

  isDead(): boolean {
    return this._health <= 0;
  }

  getEmoji(): string {
    return this.type.getEmoji(this._currentStage.value);
  }

  toData(): PlantData {
    return {
      id: this.id,
      type: this.type.key,
      plantedDay: this.plantedDay,
      currentStage: this._currentStage.value as GrowthStageType,
      health: this._health,
      growthProgress: this._growthProgress,
    };
  }
}
