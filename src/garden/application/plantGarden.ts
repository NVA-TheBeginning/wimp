import { Crop } from "@/crops/domain/aggregates/crop";
import { CropName } from "@/crops/domain/value-objects/cropName";
import { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";
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

  const cropEntities: Crop[] = rawCrops
    .filter((c) => selectedSlugs.has(c.slug))
    .map((c) =>
      Crop.create(
        CropName.create(c.name),
        HarvestPeriod.create(c.medianDaysToFirstHarvest ?? 0, c.medianDaysToLastHarvest ?? 0, c.medianLifespan ?? 0),
        registry,
      ),
    );

  const totalSlots = garden.getDimension() * garden.getDimension();
  const strategy = new GreedyPlantingStrategy();
  const layout = strategy.planLinearLayout(cropEntities, registry, totalSlots);

  garden.plantCrops(layout.getCropsInOrder());

  return { garden, layout };
}
