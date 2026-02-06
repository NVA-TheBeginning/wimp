import { existsSync, readFileSync } from "node:fs";
import { PlantId } from "@/planting-intelligence/domain/value-objects/plantId";
import type { CompanionKnowledgePort } from "@/planting-intelligence/ports/out/companionKnowledgePort";

type EdgeType = "helps" | "avoid" | "helped_by";

interface RawCompanionEdge {
  from: string;
  to: string;
  type: EdgeType;
}

export class JsonCompanionKnowledge implements CompanionKnowledgePort {
  private readonly helpsFrom = new Map<string, Set<string>>();
  private readonly helpsTo = new Map<string, Set<string>>();
  private readonly avoidPairs = new Set<string>();

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
    const a = first.getValue();
    const b = second.getValue();
    return this.avoidPairs.has(this.key(a, b)) || this.avoidPairs.has(this.key(b, a));
  }

  getCompatibilityScore(first: PlantId, second: PlantId): number {
    if (this.isForbiddenPair(first, second)) {
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
