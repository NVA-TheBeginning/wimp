import companionsData from "@/../data/companions.json" with { type: "json" };
import type { CompanionRegistry } from "@/crops/domain/services/companionRegistry";
import { CropName } from "@/crops/domain/value-objects/cropName";

enum RelationType {
  Helps = "helps",
  Avoid = "avoid",
}

interface Relationship {
  source: string;
  relation: RelationType;
  destination: string;
}

export class CsvCompanionRegistry implements CompanionRegistry {
  private readonly relationships: Map<string, Relationship[]>;

  private constructor(relationships: Map<string, Relationship[]>) {
    this.relationships = relationships;
  }

  static create(): CsvCompanionRegistry {
    const header = "source,relation,destination";
    const lines = (companionsData as { from: string; to: string; type: string }[])
      .filter((edge) => edge.type === "helps" || edge.type === "avoid")
      .map((edge) => `${edge.from},${edge.type},${edge.to}`);

    const csvData = [header, ...lines].join("\n");
    return CsvCompanionRegistry.fromCsv(csvData);
  }

  static fromCsv(csvData: string): CsvCompanionRegistry {
    const lines = csvData.trim().split("\n");
    const relationships = new Map<string, Relationship[]>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const parsedFields: string[] = [];
      let fieldBuffer = "";
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          parsedFields.push(fieldBuffer.trim());
          fieldBuffer = "";
        } else {
          fieldBuffer += char;
        }
      }
      parsedFields.push(fieldBuffer.trim());

      const cropSource = parsedFields[0];
      const relationType = parsedFields[1];
      const cropDestination = parsedFields[2];

      if (!(cropSource && relationType && cropDestination)) continue;
      if (!Object.values(RelationType).includes(relationType as RelationType)) continue;

      const normalizedSource = cropSource.toLowerCase();
      const normalizedDestination = cropDestination.toLowerCase();
      const validRelation: RelationType = relationType as RelationType;
      const relationship: Relationship = {
        source: normalizedSource,
        relation: validRelation,
        destination: normalizedDestination,
      };

      if (!relationships.has(normalizedSource)) {
        relationships.set(normalizedSource, []);
      }
      const sourceRelationships = relationships.get(normalizedSource);
      if (sourceRelationships) {
        sourceRelationships.push(relationship);
      }
    }

    return new CsvCompanionRegistry(relationships);
  }

  isHelpful(crop: CropName, companion: CropName): boolean {
    const cropRelationships = this.relationships.get(crop.getValue()) || [];
    return cropRelationships.some((r) => r.destination === companion.getValue() && r.relation === RelationType.Helps);
  }

  isForbidden(crop: CropName, companion: CropName): boolean {
    const cropRelationships = this.relationships.get(crop.getValue()) || [];
    return cropRelationships.some((r) => r.destination === companion.getValue() && r.relation === RelationType.Avoid);
  }

  getHelpfulCompanions(crop: CropName): CropName[] {
    const cropRelationships = this.relationships.get(crop.getValue()) || [];
    return cropRelationships
      .filter((r) => r.relation === RelationType.Helps)
      .map((r) => CropName.create(r.destination));
  }

  getForbiddenCompanions(crop: CropName): CropName[] {
    const cropRelationships = this.relationships.get(crop.getValue()) || [];
    return cropRelationships
      .filter((r) => r.relation === RelationType.Avoid)
      .map((r) => CropName.create(r.destination));
  }
}
