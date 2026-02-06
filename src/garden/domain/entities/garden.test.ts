import { describe, expect, test } from "bun:test";
import { Crop } from "@/crops/domain/aggregates/crop";
import { CropName } from "@/crops/domain/value-objects/cropName";
import { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";
import { CsvCompanionRegistry } from "@/crops/infrastructure/csvLoader";
import { Garden } from "@/garden/domain/entities/garden";
import { GardenPlanted } from "@/garden/domain/events/gardenPlanted";
import { GardenSize } from "@/garden/domain/value-objects/gardenSize";

function createRegistry(): CsvCompanionRegistry {
  return CsvCompanionRegistry.fromCsv("source,relation,destination");
}

function createCrop(name: string, registry: CsvCompanionRegistry): Crop {
  return Crop.create(CropName.create(name), HarvestPeriod.create(30, 60, 90), registry);
}

describe("Garden", () => {
  describe("domain events", () => {
    test("emits GardenPlanted event when crops are planted", () => {
      const registry = createRegistry();
      const garden = Garden.create(GardenSize.create("SMALL"));
      const crops = [createCrop("tomato", registry), createCrop("basil", registry)];

      garden.plantCrops(crops);

      const events = garden.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(GardenPlanted);
      expect((events[0] as GardenPlanted).totalCropsPlaced).toBe(2);
    });

    test("pullDomainEvents clears events after retrieval", () => {
      const registry = createRegistry();
      const garden = Garden.create(GardenSize.create("SMALL"));
      const crops = [createCrop("tomato", registry)];

      garden.plantCrops(crops);

      const firstPull = garden.pullDomainEvents();
      expect(firstPull).toHaveLength(1);

      const secondPull = garden.pullDomainEvents();
      expect(secondPull).toHaveLength(0);
    });
  });
});
