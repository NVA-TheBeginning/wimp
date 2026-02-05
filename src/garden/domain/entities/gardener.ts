import type { Crops } from "../../../crops/domain/entities/crops";

export class Gardener {
  name: string;
  goal: Crops[];

  constructor(name: string, goal: Crops[]) {
    this.name = name;
    this.goal = goal;
  }
}
