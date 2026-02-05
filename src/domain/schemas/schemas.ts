import { z } from "zod/v4";

export const gardenSizeEnum = ["SMALL", "MEDIUM", "LARGE"] as const;
export type GardenSize = (typeof gardenSizeEnum)[number];

export const PositionSchema = z.object({
  x: z.number().int().min(0).max(4),
  y: z.number().int().min(0).max(4),
});

export const GrowthStageSchema = z.enum(["SEED", "SPROUT", "GROWING", "MATURE", "HARVESTABLE"]);

export const SeasonSchema = z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]);

export const PlantTypeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  daysToFirstHarvest: z.number().positive(),
  daysToLastHarvest: z.number().positive(),
  lifespan: z.number().positive(),
  companions: z.array(z.string()),
  incompatible: z.array(z.string()),
  scientificName: z.string(),
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
