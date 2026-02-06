import { describe, expect, test } from "bun:test";
import type { PlantAllocation } from "@/garden/domain/aggregates/plantingPlan";
import { LayoutPlanner } from "@/garden/domain/services/layoutPlanner";
import type { CompanionKnowledge } from "@/garden/domain/services/companionKnowledge";
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

  getCompanionCandidates(_plantId: PlantId): PlantId[] {
    return [];
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

function allocation(plantId: string, quantity: number, source: "selected" | "companion"): PlantAllocation {
  return {
    plantId: PlantId.create(plantId),
    quantity,
    source,
  };
}

describe("LayoutPlanner", () => {
  test("creates positions inside the garden square", () => {
    const knowledge = new InMemoryCompanionKnowledge();
    knowledge.addHelp("tomato", "basil");
    knowledge.addHelp("basil", "tomato");
    knowledge.addAvoid("tomato", "potato");

    const planner = new LayoutPlanner(knowledge);
    const plan = planner.plan(
      [
        allocation("tomato", 2, "selected"),
        allocation("basil", 2, "companion"),
        allocation("carrot", 1, "selected"),
      ],
      GardenArea.create(5),
    );

    const side = Math.sqrt(5);
    expect(plan.positions).toHaveLength(5);
    expect(plan.gridSide).toBe(3);
    expect(plan.cellSizeMeters).toBeCloseTo(side / 3, 6);

    const uniqueCoordinates = new Set(plan.positions.map((position) => `${position.gridX},${position.gridY}`));
    expect(uniqueCoordinates.size).toBe(plan.positions.length);

    for (const position of plan.positions) {
      expect(position.x).toBeGreaterThan(0);
      expect(position.y).toBeGreaterThan(0);
      expect(position.x).toBeLessThanOrEqual(side);
      expect(position.y).toBeLessThanOrEqual(side);
    }
  });
});
