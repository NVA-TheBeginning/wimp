import { PLANT_DATA, type PlantTypeConfig } from "../data/plants";

export class PlantType {
  readonly config: PlantTypeConfig;

  private constructor(config: PlantTypeConfig) {
    this.config = config;
  }

  static fromName(name: string): PlantType {
    const config = PLANT_DATA[name.toLowerCase()];
    if (!config) throw new Error(`Unknown plant type: ${name}`);
    return new PlantType(config);
  }

  get name(): string {
    return this.config.name;
  }

  get key(): string {
    return this.config.name.toLowerCase();
  }

  get daysToHarvest(): number {
    return this.config.daysToFirstHarvest;
  }

  isCompanion(other: PlantType): boolean {
    return this.config.companions.includes(other.key);
  }

  isIncompatible(other: PlantType): boolean {
    return this.config.incompatible.includes(other.key);
  }

  getEmoji(stage: string): string {
    const key = stage.toLowerCase() as keyof PlantTypeConfig["emoji"];
    return this.config.emoji[key] || "❓";
  }
}
