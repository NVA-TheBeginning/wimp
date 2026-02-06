import { PlantId } from "@/planting-intelligence/domain/value-objects/plantId";
import type { CompanionKnowledgePort } from "@/planting-intelligence/ports/out/companionKnowledgePort";
import { capitalize, truncate } from "@/ui/utils/text";

interface InspectNeighborProps {
  label: string;
  neighborRow: number;
  neighborCol: number;
  gridSide: number;
  plantByCell: Array<Array<string | null>>;
  codeByPlantId: Map<string, string>;
  cropNamesBySlug: Map<string, string>;
  selectedPlant: PlantId | null;
  companionKnowledge: CompanionKnowledgePort;
}

export function InspectNeighbor({
  label,
  neighborRow,
  neighborCol,
  gridSide,
  plantByCell,
  codeByPlantId,
  cropNamesBySlug,
  selectedPlant,
  companionKnowledge,
}: InspectNeighborProps) {
  if (neighborRow < 0 || neighborRow >= gridSide || neighborCol < 0 || neighborCol >= gridSide) {
    return (
      <text>
        <span fg="#9E9E9E">{`${label}: `}</span>
        <span fg="#5D4037">edge</span>
      </text>
    );
  }

  const neighborPlantId = plantByCell[neighborRow]?.[neighborCol];
  if (!neighborPlantId) {
    return (
      <text>
        <span fg="#9E9E9E">{`${label}: `}</span>
        <span fg="#9E9E9E">empty</span>
      </text>
    );
  }

  const neighborName = truncate(capitalize(cropNamesBySlug.get(neighborPlantId) ?? neighborPlantId), 12);
  const neighborCode = codeByPlantId.get(neighborPlantId) ?? "??";

  if (!selectedPlant) {
    return (
      <text>
        <span fg="#9E9E9E">{`${label}: `}</span>
        <span fg="#E0E0E0">{`${neighborCode} ${neighborName}`}</span>
      </text>
    );
  }

  const neighborPlant = PlantId.create(neighborPlantId);
  const score = companionKnowledge.getCompatibilityScore(selectedPlant, neighborPlant);

  if (score < 0) {
    return (
      <text>
        <span fg="#9E9E9E">{`${label}: `}</span>
        <b fg="#EF5350">{`${neighborCode} ${neighborName} \u2192 incompatible (${score})`}</b>
      </text>
    );
  }

  if (score > 0) {
    return (
      <text>
        <span fg="#9E9E9E">{`${label}: `}</span>
        <b fg="#66BB6A">{`${neighborCode} ${neighborName} \u2192 compatible (+${score})`}</b>
      </text>
    );
  }

  return (
    <text>
      <span fg="#9E9E9E">{`${label}: `}</span>
      <span fg="#9E9E9E">{`${neighborCode} ${neighborName} \u2192 neutral (0)`}</span>
    </text>
  );
}
