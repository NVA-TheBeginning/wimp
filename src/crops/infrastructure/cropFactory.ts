import { Crop } from "@/crops/domain/aggregates/crop";
import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import { CropName } from "@/crops/domain/value-objects/cropName";
import { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";
import type { GrowstuffCrop } from "@/crops/infrastructure/schemas/infrastructure";

export function createCropFromGrowstuff(raw: GrowstuffCrop, registry: CompanionRegistry): Crop {
  return Crop.create(
    CropName.create(raw.name),
    HarvestPeriod.create(raw.medianDaysToFirstHarvest ?? 0, raw.medianDaysToLastHarvest ?? 0, raw.medianLifespan ?? 0),
    registry,
  );
}
