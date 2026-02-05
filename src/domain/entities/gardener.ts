import type { Crops } from "./crops";

export class Gardener {
    name: string;
    goal: Crops[];

    constructor(name: string, goal: Crops[]) {
        this.name = name;
        this.goal = goal;
    }
}
