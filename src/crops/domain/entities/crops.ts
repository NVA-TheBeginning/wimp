export class Crops {
  name: string;
  companions: Crops[];
  spread: number;
  rowSpacing: number;
  firstHarvest: number;
  lastHarvest: number;
  lifeSpan: number;

  constructor(
    name: string,
    companions: Crops[],
    spread: number,
    rowSpacing: number,
    firstHarvest: number,
    lastHarvest: number,
    lifeSpan: number,
  ) {
    this.name = name;
    this.companions = companions;
    this.spread = spread;
    this.rowSpacing = rowSpacing;
    this.firstHarvest = firstHarvest;
    this.lastHarvest = lastHarvest;
    this.lifeSpan = lifeSpan;
  }
}
