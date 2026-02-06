import { describe, expect, it } from "bun:test";
import { Crop } from "@/crops/domain/aggregates/crop";
import { CropName } from "@/crops/domain/value-objects/cropName";
import { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";
import { CsvCompanionRegistry } from "@/crops/infrastructure/csvLoader";
import { GreedyPlantingStrategy } from "@/planting-intelligence/domain/services/plantingStrategy";
import { CompanionState } from "@/planting-intelligence/domain/value-objects/companionState";

function createRegistry(csvData: string): CsvCompanionRegistry {
  return CsvCompanionRegistry.fromCsv(csvData);
}

function createCrop(name: string, registry: CsvCompanionRegistry): Crop {
  return Crop.create(CropName.create(name), HarvestPeriod.create(30, 60, 90), registry);
}

describe("PlantingStrategy", () => {
  it("returns empty result for empty crop list", () => {
    const registry = createRegistry("source,relation,destination");
    const strategy = new GreedyPlantingStrategy();

    const result = strategy.planLinearLayout([], registry, 10);

    expect(result.getCropsInOrder()).toHaveLength(0);
    expect(result.getNeighborStates()).toHaveLength(0);
    expect(result.getUnplacedCrops()).toHaveLength(0);
  });

  it("fills the grid by cycling crops", () => {
    const registry = createRegistry("source,relation,destination");
    const strategy = new GreedyPlantingStrategy();

    const tomato = createCrop("tomato", registry);
    const basil = createCrop("basil", registry);

    const result = strategy.planLinearLayout([tomato, basil], registry, 9);

    expect(result.getCropsInOrder()).toHaveLength(9);
    expect(result.getUnplacedCrops()).toHaveLength(0);
  });

  it("does not place incompatible neighbors next to each other when avoidable", () => {
    const csvData = `source,relation,destination
tomato,avoid,potato
potato,avoid,tomato`;

    const registry = createRegistry(csvData);
    const strategy = new GreedyPlantingStrategy();

    const tomato = createCrop("tomato", registry);
    const potato = createCrop("potato", registry);
    const basil = createCrop("basil", registry);

    const result = strategy.planLinearLayout([tomato, potato, basil], registry, 3);

    const neighborStates = result.getNeighborStates();
    expect(neighborStates.every((n) => n.state !== CompanionState.INCOMPATIBLE)).toBe(true);
  });

  it("prefers beneficial neighbors over neutral ones", () => {
    const csvData = `source,relation,destination
tomato,helps,basil
basil,helps,tomato`;

    const registry = createRegistry(csvData);
    const strategy = new GreedyPlantingStrategy();

    const tomato = createCrop("tomato", registry);
    const basil = createCrop("basil", registry);
    const carrot = createCrop("carrot", registry);

    const result = strategy.planLinearLayout([tomato, basil, carrot], registry, 3);

    const cropsInOrder = result.getCropsInOrder();
    const names = cropsInOrder.map((c) => c.getName().getValue());

    expect(names[0]).toBe("tomato");
    expect(names[1]).toBe("basil");
    expect(names[2]).toBe("carrot");

    const neighborStates = result.getNeighborStates();
    expect(neighborStates[0]?.state).toBe(CompanionState.BENEFICIAL);
  });

  it("fills all slots even with only one crop", () => {
    const registry = createRegistry("source,relation,destination");
    const strategy = new GreedyPlantingStrategy();

    const tomato = createCrop("tomato", registry);

    const result = strategy.planLinearLayout([tomato], registry, 4);

    expect(result.getCropsInOrder()).toHaveLength(4);
    expect(result.getCropsInOrder().every((c) => c.getName().getValue() === "tomato")).toBe(true);
  });
});
