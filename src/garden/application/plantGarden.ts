import { createCropFromGrowstuff } from "@/crops/infrastructure/cropFactory";
import { CsvCompanionRegistry } from "@/crops/infrastructure/csvLoader";
import type { GrowstuffCrop } from "@/crops/infrastructure/schemas/infrastructure";
import { Garden } from "@/garden/domain/entities/garden";
import type { GardenSize } from "@/garden/domain/value-objects/gardenSize";
import type { PlantingLayoutResult } from "@/planting-intelligence/domain/services/plantingLayoutResult";
import { GreedyPlantingStrategy } from "@/planting-intelligence/domain/services/plantingStrategy";

export interface PlantGardenResult {
  garden: Garden;
  layout: PlantingLayoutResult;
}

export function plantGarden(
  rawCrops: GrowstuffCrop[],
  selectedSlugs: Set<string>,
  size: GardenSize,
): PlantGardenResult {
  const garden = Garden.create(size);
  const registry = CsvCompanionRegistry.create();

  const cropEntities = rawCrops
    .filter((c) => selectedSlugs.has(c.slug))
    .map((c) => createCropFromGrowstuff(c, registry));

  const totalSlots = garden.getDimension() * garden.getDimension();
  const strategy = new GreedyPlantingStrategy();
  const layout = strategy.planLinearLayout(cropEntities, registry, totalSlots);

  garden.plantCrops(layout.getCropsInOrder());

  return { garden, layout };
}
