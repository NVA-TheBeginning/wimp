import type { GardenArea } from "@/planting-intelligence/domain/value-objects/gardenArea";
import type { PlantId } from "@/planting-intelligence/domain/value-objects/plantId";

export type PlantAllocationSource = "selected" | "companion";

export interface PlantAllocation {
  plantId: PlantId;
  quantity: number;
  source: PlantAllocationSource;
}

export interface PositionedPlant {
  plantId: PlantId;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
}

export class PlantingPlan {
  private readonly area: GardenArea;
  private readonly allocations: PlantAllocation[];
  private readonly positions: PositionedPlant[];
  private readonly gridSide: number;
  private readonly cellSizeMeters: number;

  private constructor(
    area: GardenArea,
    allocations: PlantAllocation[],
    positions: PositionedPlant[],
    gridSide: number,
    cellSizeMeters: number,
  ) {
    this.area = area;
    this.allocations = allocations;
    this.positions = positions;
    this.gridSide = gridSide;
    this.cellSizeMeters = cellSizeMeters;
  }

  static create(
    area: GardenArea,
    allocations: PlantAllocation[],
    positions: PositionedPlant[],
    gridSide: number,
    cellSizeMeters: number,
  ): PlantingPlan {
    return new PlantingPlan(area, allocations, positions, gridSide, cellSizeMeters);
  }

  getArea(): GardenArea {
    return this.area;
  }

  getAllocations(): PlantAllocation[] {
    return [...this.allocations];
  }

  getPositions(): PositionedPlant[] {
    return [...this.positions];
  }

  getGridSide(): number {
    return this.gridSide;
  }

  getCellSizeMeters(): number {
    return this.cellSizeMeters;
  }
}
