import { z } from "zod";

export const PositionSchema = z.object({
  x: z.number().int().min(0).max(4),
  y: z.number().int().min(0).max(4),
});

export const GrowthStageSchema = z.enum(["SEED", "SPROUT", "GROWING", "MATURE", "HARVESTABLE"]);

export const SeasonSchema = z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]);

export const SunNeedsSchema = z.enum(["full", "partial"]);

export const PlantTypeSchema = z.object({
  name: z.string(),
  daysToFirstHarvest: z.number().positive(),
  daysToLastHarvest: z.number().positive(),
  lifespan: z.number().positive(),
  sunNeeds: SunNeedsSchema,
  companions: z.array(z.string()),
  incompatible: z.array(z.string()),
});

export const PlantSchema = z.object({
  id: z.string(),
  type: z.string(),
  plantedDay: z.number().int().min(0),
  currentStage: GrowthStageSchema,
  health: z.number().min(0).max(100),
  growthProgress: z.number().min(0),
});

export const PlotSchema = z.object({
  position: PositionSchema,
  soilMoisture: z.number().min(0).max(100),
  plant: PlantSchema.nullable(),
});

export const GardenSchema = z.object({
  plots: z.array(PlotSchema),
  currentDay: z.number().int().min(0),
  season: SeasonSchema,
});

export type Position = z.infer<typeof PositionSchema>;
export type GrowthStage = z.infer<typeof GrowthStageSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type PlantData = z.infer<typeof PlantSchema>;
export type PlotData = z.infer<typeof PlotSchema>;
export type GardenData = z.infer<typeof GardenSchema>;
