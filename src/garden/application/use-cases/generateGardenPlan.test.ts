import { describe, expect, test } from "bun:test";
import { GenerateGardenPlanUseCase } from "@/garden/application/use-cases/generateGardenPlan";
import type { CompanionKnowledge } from "@/garden/domain/services/companionKnowledge";
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
      if (!from || !to) continue;

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

describe("GenerateGardenPlanUseCase", () => {
  test("returns a planting list and positions for the square garden", () => {
    const knowledge = new InMemoryCompanionKnowledge();
    knowledge.addHelp("tomato", "basil");
    knowledge.addHelp("basil", "tomato");
    knowledge.addHelp("carrot", "tomato");
    knowledge.addAvoid("tomato", "potato");

    const useCase = new GenerateGardenPlanUseCase(knowledge);
    const output = useCase.execute({
      selectedPlantIds: ["tomato", "carrot"],
      areaM2: 4,
    });

    expect(output.areaM2).toBe(4);
    expect(output.sideLengthMeters).toBe(2);
    expect(output.allocations.some((allocation) => allocation.plantId === "tomato")).toBe(true);
    expect(output.allocations.some((allocation) => allocation.plantId === "carrot")).toBe(true);
    expect(output.positions).toHaveLength(4);

    const totalQuantity = output.allocations.reduce((sum, allocation) => sum + allocation.quantity, 0);
    expect(totalQuantity).toBe(4);
  });
});
