import type { CompanionKnowledge } from "@/garden/domain/services/companionKnowledge";
import { CompanionListOptimizer } from "@/garden/domain/services/companionListOptimizer";
import { GardenArea } from "@/garden/domain/value-objects/gardenArea";
import { PlantId } from "@/garden/domain/value-objects/plantId";

export interface GenerateCompanionListInput {
  selectedPlantIds: string[];
  areaM2: number;
}

export interface GenerateCompanionListOutput {
  areaM2: number;
  sideLengthMeters: number;
  capacity: number;
  allocations: Array<{
    plantId: string;
    quantity: number;
    source: "selected" | "companion";
  }>;
}

export class GenerateCompanionListUseCase {
  private readonly optimizer: CompanionListOptimizer;

  constructor(knowledge: CompanionKnowledge) {
    this.optimizer = new CompanionListOptimizer(knowledge);
  }

  execute(input: GenerateCompanionListInput): GenerateCompanionListOutput {
    const area = GardenArea.create(input.areaM2);
    const selectedPlants = input.selectedPlantIds.map((plantId) => PlantId.create(plantId));
    const allocations = this.optimizer.optimize(selectedPlants, area);

    return {
      areaM2: area.getAreaM2(),
      sideLengthMeters: area.getSideLengthMeters(),
      capacity: area.getPlantCapacity(),
      allocations: allocations.map((item) => ({
        plantId: item.plantId.getValue(),
        quantity: item.quantity,
        source: item.source,
      })),
    };
  }
}
