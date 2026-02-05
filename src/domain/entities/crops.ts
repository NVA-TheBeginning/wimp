export class Crops {
  name: string;
  companinons: Crops[];
  spread: number;
  rowSpacing: number;
  firstHarvest: number;
  lastHarvest: number;
  lifeSpan: number;

  constructor(
    name: string,
    companinons: Crops[],
    spread: number,
    rowSpacing: number,
    firstHarvest: number,
    lastHarvest: number,
    lifeSpan: number,
  ) {
    this.name = name;
    this.companinons = companinons;
    this.spread = spread;
    this.rowSpacing = rowSpacing;
    this.firstHarvest = firstHarvest;
    this.lastHarvest = lastHarvest;
    this.lifeSpan = lifeSpan;
  }
}
