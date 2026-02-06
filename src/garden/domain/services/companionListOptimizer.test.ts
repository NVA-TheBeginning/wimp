import { describe, expect, test } from "bun:test";
import { IncompatibleSelectedPlants, InvalidPlantSelection } from "@/garden/domain/errors/errors";
import type { CompanionKnowledge } from "@/garden/domain/services/companionKnowledge";
import { CompanionListOptimizer } from "@/garden/domain/services/companionListOptimizer";
import { GardenArea } from "@/garden/domain/value-objects/gardenArea";
import { PlantId } from "@/garden/domain/value-objects/plantId";

class InMemoryCompanionKnowledge implements CompanionKnowledge {
  private readonly helps = new Set<string>();
  private readonly avoids = new Set<string>();

  addHelp(from: string, to: string): void {
    this.helps.add(`${from}>>${to}`);
  }

  addAvoid(from: string, to: string): void {
    this.avoids.add(`${from}>>${to}`);
  }

  getCompanionCandidates(plantId: PlantId): PlantId[] {
    const id = plantId.getValue();
    const candidates = new Set<string>();

    for (const relation of this.helps) {
      const [from, to] = relation.split(">>");
      if (!(from && to)) continue;

      if (from === id) candidates.add(to);
      if (to === id) candidates.add(from);
    }

    return Array.from(candidates).map((candidate) => PlantId.create(candidate));
  }

  isForbiddenPair(first: PlantId, second: PlantId): boolean {
    const a = first.getValue();
    const b = second.getValue();
    return this.avoids.has(`${a}>>${b}`) || this.avoids.has(`${b}>>${a}`);
  }

  getCompatibilityScore(first: PlantId, second: PlantId): number {
    if (this.isForbiddenPair(first, second)) return -100;

    const a = first.getValue();
    const b = second.getValue();
    let score = 0;
    if (this.helps.has(`${a}>>${b}`)) score += 2;
    if (this.helps.has(`${b}>>${a}`)) score += 2;
    return score;
  }
}

function pid(value: string): PlantId {
  return PlantId.create(value);
}

describe("CompanionListOptimizer", () => {
  test("adds compatible companions and fills the garden capacity", () => {
    const knowledge = new InMemoryCompanionKnowledge();
    knowledge.addHelp("tomato", "basil");
    knowledge.addHelp("basil", "tomato");
    knowledge.addHelp("carrot", "tomato");
    knowledge.addAvoid("tomato", "potato");

    const optimizer = new CompanionListOptimizer(knowledge);
    const allocations = optimizer.optimize([pid("tomato"), pid("carrot")], GardenArea.create(6));

    const totalQuantity = allocations.reduce((sum, allocation) => sum + allocation.quantity, 0);
    expect(totalQuantity).toBe(6);
    expect(allocations.some((allocation) => allocation.plantId.getValue() === "basil")).toBe(true);
    expect(allocations.some((allocation) => allocation.plantId.getValue() === "potato")).toBe(false);
  });

  test("throws when selected plants are incompatible", () => {
    const knowledge = new InMemoryCompanionKnowledge();
    knowledge.addAvoid("tomato", "potato");

    const optimizer = new CompanionListOptimizer(knowledge);
    expect(() => optimizer.optimize([pid("tomato"), pid("potato")], GardenArea.create(4))).toThrow(
      IncompatibleSelectedPlants,
    );
  });

  test("throws when the user selects no plant", () => {
    const knowledge = new InMemoryCompanionKnowledge();
    const optimizer = new CompanionListOptimizer(knowledge);

    expect(() => optimizer.optimize([], GardenArea.create(4))).toThrow(InvalidPlantSelection);
  });

  test("accepts more than three selected plants when capacity allows", () => {
    const knowledge = new InMemoryCompanionKnowledge();
    knowledge.addHelp("tomato", "basil");
    knowledge.addHelp("carrot", "onion");

    const optimizer = new CompanionListOptimizer(knowledge);
    const allocations = optimizer.optimize(
      [pid("tomato"), pid("carrot"), pid("basil"), pid("onion")],
      GardenArea.create(8),
    );

    const totalQuantity = allocations.reduce((sum, allocation) => sum + allocation.quantity, 0);
    expect(totalQuantity).toBe(8);
    expect(allocations.filter((allocation) => allocation.source === "selected")).toHaveLength(4);
  });
});
