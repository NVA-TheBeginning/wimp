import { PlantingPlan } from "@/garden/domain/aggregates/plantingPlan";
import { CompanionListOptimizer } from "@/garden/domain/services/companionListOptimizer";
import type { CompanionKnowledge } from "@/garden/domain/services/companionKnowledge";
import { LayoutPlanner } from "@/garden/domain/services/layoutPlanner";
import { GardenArea } from "@/garden/domain/value-objects/gardenArea";
import { PlantId } from "@/garden/domain/value-objects/plantId";

export interface GenerateGardenPlanInput {
  selectedPlantIds: string[];
  areaM2: number;
}

export interface GenerateGardenPlanOutput {
  areaM2: number;
  sideLengthMeters: number;
  gridSide: number;
  cellSizeMeters: number;
  allocations: Array<{
    plantId: string;
    quantity: number;
    source: "selected" | "companion";
  }>;
  positions: Array<{
    plantId: string;
    x: number;
    y: number;
    gridX: number;
    gridY: number;
  }>;
}

export class GenerateGardenPlanUseCase {
  private readonly optimizer: CompanionListOptimizer;
  private readonly layoutPlanner: LayoutPlanner;

  constructor(knowledge: CompanionKnowledge) {
    this.optimizer = new CompanionListOptimizer(knowledge);
    this.layoutPlanner = new LayoutPlanner(knowledge);
  }

  execute(input: GenerateGardenPlanInput): GenerateGardenPlanOutput {
    const area = GardenArea.create(input.areaM2);
    const selectedPlantIds = input.selectedPlantIds.map((id) => PlantId.create(id));

    const allocations = this.optimizer.optimize(selectedPlantIds, area);
    const layout = this.layoutPlanner.plan(allocations, area);
    const plan = PlantingPlan.create(area, allocations, layout.positions, layout.gridSide, layout.cellSizeMeters);

    return {
      areaM2: plan.getArea().getAreaM2(),
      sideLengthMeters: plan.getArea().getSideLengthMeters(),
      gridSide: plan.getGridSide(),
      cellSizeMeters: plan.getCellSizeMeters(),
      allocations: plan.getAllocations().map((item) => ({
        plantId: item.plantId.getValue(),
        quantity: item.quantity,
        source: item.source,
      })),
      positions: plan.getPositions().map((position) => ({
        plantId: position.plantId.getValue(),
        x: position.x,
        y: position.y,
        gridX: position.gridX,
        gridY: position.gridY,
      })),
    };
  }
}
