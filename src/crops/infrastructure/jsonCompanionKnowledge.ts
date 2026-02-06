import { existsSync, readFileSync } from "node:fs";
import { Crop } from "@/crops/domain/aggregates/crop";
import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import { CropName } from "@/crops/domain/value-objects/cropName";
import { HarvestPeriod } from "@/crops/domain/value-objects/harvestPeriod";
import { PlantId } from "@/planting-intelligence/domain/value-objects/plantId";
import type { CompanionKnowledgePort } from "@/planting-intelligence/ports/out/companionKnowledgePort";

type EdgeType = "helps" | "avoid" | "helped_by";

interface RawCompanionEdge {
  from: string;
  to: string;
  type: EdgeType;
}

export class JsonCompanionKnowledge implements CompanionKnowledgePort, CompanionRegistry {
  private static readonly DEFAULT_HARVEST_PERIOD = HarvestPeriod.create(0, 0, 0);

  private readonly helpsFrom = new Map<string, Set<string>>();
  private readonly helpsTo = new Map<string, Set<string>>();
  private readonly avoidPairs = new Set<string>();
  private readonly cropCache = new Map<string, Crop>();

  constructor(path = "data/companions.json") {
    const resolvedPath = this.resolvePath(path);
    const raw = JSON.parse(readFileSync(resolvedPath, "utf-8")) as RawCompanionEdge[];

    for (const edge of raw) {
      this.addEdge(edge);
    }
  }

  getCompanionCandidates(plantId: PlantId): PlantId[] {
    const id = plantId.getValue();
    const outgoing = this.helpsFrom.get(id) ?? new Set<string>();
    const incoming = this.helpsTo.get(id) ?? new Set<string>();
    const union = new Set<string>([...outgoing, ...incoming]);

    const candidates: PlantId[] = [];
    for (const candidate of union) {
      candidates.push(PlantId.create(candidate));
    }
    return candidates;
  }

  isForbiddenPair(first: PlantId, second: PlantId): boolean {
    return !this.canAssociate(first, second);
  }

  getCompatibilityScore(first: PlantId, second: PlantId): number {
    if (!this.canAssociate(first, second)) {
      return -100;
    }

    const a = first.getValue();
    const b = second.getValue();
    let score = 0;

    if (this.helpsFrom.get(a)?.has(b)) {
      score += 2;
    }
    if (this.helpsFrom.get(b)?.has(a)) {
      score += 2;
    }

    return score;
  }

  isHelpful(crop: CropName, companion: CropName): boolean {
    const source = crop.getValue();
    const destination = companion.getValue();
    return this.helpsFrom.get(source)?.has(destination) ?? false;
  }

  isForbidden(crop: CropName, companion: CropName): boolean {
    const source = crop.getValue();
    const destination = companion.getValue();
    return this.avoidPairs.has(this.key(source, destination)) || this.avoidPairs.has(this.key(destination, source));
  }

  getHelpfulCompanions(crop: CropName): CropName[] {
    const source = crop.getValue();
    const companions = this.helpsFrom.get(source) ?? new Set<string>();
    return Array.from(companions).map((companion) => CropName.create(companion));
  }

  getForbiddenCompanions(crop: CropName): CropName[] {
    const source = crop.getValue();
    const companions = new Set<string>();

    for (const pair of this.avoidPairs) {
      const [from, to] = pair.split(">>");
      if (!(from && to)) continue;

      if (from === source) {
        companions.add(to);
      } else if (to === source) {
        companions.add(from);
      }
    }

    return Array.from(companions).map((companion) => CropName.create(companion));
  }

  private resolvePath(path: string): string {
    if (existsSync(path)) {
      return path;
    }

    const fallback = "data/companions.json";
    if (path !== fallback && existsSync(fallback)) {
      return fallback;
    }

    throw new Error(`Companion dataset not found at "${path}"`);
  }

  private addEdge(edge: RawCompanionEdge): void {
    const from = this.safeCreatePlantId(edge.from);
    const to = this.safeCreatePlantId(edge.to);
    if (!(from && to)) return;

    if (edge.type === "helps") {
      this.addHelp(from.getValue(), to.getValue());
      return;
    }

    if (edge.type === "helped_by") {
      this.addHelp(to.getValue(), from.getValue());
      return;
    }

    if (edge.type === "avoid") {
      this.avoidPairs.add(this.key(from.getValue(), to.getValue()));
    }
  }

  private addHelp(from: string, to: string): void {
    if (!this.helpsFrom.has(from)) {
      this.helpsFrom.set(from, new Set<string>());
    }
    if (!this.helpsTo.has(to)) {
      this.helpsTo.set(to, new Set<string>());
    }

    this.helpsFrom.get(from)?.add(to);
    this.helpsTo.get(to)?.add(from);
  }

  private canAssociate(first: PlantId, second: PlantId): boolean {
    // A plant can coexist with the same species in the layout; self-association rule is for companion relation modeling.
    if (first.equals(second)) {
      return true;
    }

    return this.toCrop(first).canAssociateWith(this.toCrop(second));
  }

  private toCrop(plantId: PlantId): Crop {
    const key = plantId.getValue();
    const cached = this.cropCache.get(key);
    if (cached) {
      return cached;
    }

    const crop = Crop.create(CropName.create(key), JsonCompanionKnowledge.DEFAULT_HARVEST_PERIOD, this);
    this.cropCache.set(key, crop);
    return crop;
  }

  private safeCreatePlantId(raw: string): PlantId | null {
    try {
      return PlantId.create(raw);
    } catch {
      return null;
    }
  }

  private key(first: string, second: string): string {
    return `${first}>>${second}`;
  }
}
