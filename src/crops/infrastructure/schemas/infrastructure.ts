import { z } from "zod/v4";

export interface GrowstuffCrop {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  perennial: boolean;
  sowingMethod: string | null;
  sunRequirements: string | null;
  rowSpacing: number | null;
  spread: number | null;
  height: number | null;
  growingDegreeDays: number | null;
  medianLifespan: number | null;
  medianDaysToFirstHarvest: number | null;
  medianDaysToLastHarvest: number | null;
  scientificName: string | null;
  companions: string[];
}

export interface RawCrop {
  crop: Omit<GrowstuffCrop, "companions">;
  openfarmId: string | null;
  companionIds: string[];
}

export const CropListResponseSchema = z.object({
  data: z.array(z.object({ links: z.object({ self: z.string() }) })),
  links: z.object({ next: z.string().optional() }),
});

export const CropDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  perennial: z.boolean().nullable(),
  sowing_method: z.string().nullable(),
  sun_requirements: z.string().nullable(),
  row_spacing: z.number().nullable(),
  spread: z.number().nullable(),
  height: z.number().nullable(),
  growing_degree_days: z.number().nullable(),
  median_lifespan: z.number().nullable(),
  median_days_to_first_harvest: z.number().nullable(),
  median_days_to_last_harvest: z.number().nullable(),
  en_wikipedia_url: z.string().nullable(),
  openfarm_data: z.any().optional(),
  scientific_names: z.array(z.object({ name: z.string() })).optional(),
});
