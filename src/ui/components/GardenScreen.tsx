import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useMemo, useState } from "react";
import type { GenerateGardenPlanOutput } from "@/planting-intelligence/application/use-cases/generateGardenPlan";
import { PlantId } from "@/planting-intelligence/domain/value-objects/plantId";
import type { CompanionKnowledgePort } from "@/planting-intelligence/ports/out/companionKnowledgePort";

interface GardenScreenProps {
  plan: GenerateGardenPlanOutput;
  cropNamesBySlug: Map<string, string>;
  companionKnowledge: CompanionKnowledgePort;
  onRestart: () => void;
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatPlanCode(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function GardenScreen({ plan, cropNamesBySlug, companionKnowledge, onRestart }: GardenScreenProps) {
  const [cursorRow, setCursorRow] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);

  const codeByPlantId = useMemo(() => {
    const map = new Map<string, string>();
    for (let index = 0; index < plan.allocations.length; index += 1) {
      const allocation = plan.allocations[index];
      if (!allocation) continue;
      map.set(allocation.plantId, formatPlanCode(index));
    }
    return map;
  }, [plan.allocations]);

  const plantByCell = useMemo(() => {
    const grid: Array<Array<string | null>> = Array.from({ length: plan.gridSide }, () =>
      Array.from({ length: plan.gridSide }, () => null),
    );

    for (const position of plan.positions) {
      const row = grid[position.gridY];
      if (!row) continue;
      row[position.gridX] = position.plantId;
    }

    return grid;
  }, [plan.gridSide, plan.positions]);

  useKeyboard((key) => {
    if (key.name === "up") setCursorRow((row) => Math.max(0, row - 1));
    if (key.name === "down") setCursorRow((row) => Math.min(plan.gridSide - 1, row + 1));
    if (key.name === "left") setCursorCol((col) => Math.max(0, col - 1));
    if (key.name === "right") setCursorCol((col) => Math.min(plan.gridSide - 1, col + 1));
    if (key.name === "q" || key.name === "r") onRestart();
  });

  const renderCell = (row: number, col: number) => {
    const plantId = plantByCell[row]?.[col];
    const code = plantId ? (codeByPlantId.get(plantId) ?? "??") : "..";
    const cellText = ` ${code} `;
    const isSelected = row === cursorRow && col === cursorCol;

    if (isSelected) {
      return (
        <text key={`${row}-${col}`} attributes={TextAttributes.INVERSE}>
          {cellText}
        </text>
      );
    }

    return (
      <text key={`${row}-${col}`} attributes={TextAttributes.DIM}>
        {cellText}
      </text>
    );
  };

  const renderRow = (row: number) => {
    const cells = Array.from({ length: plan.gridSide }, (_, col) => renderCell(row, col));
    return (
      <box key={`row-${row}`} flexDirection="row">
        {cells}
      </box>
    );
  };

  const rows = Array.from({ length: plan.gridSide }, (_, row) => renderRow(row));
  const selectedPlantId = plantByCell[cursorRow]?.[cursorCol];
  const selectedName = selectedPlantId ? capitalize(cropNamesBySlug.get(selectedPlantId) ?? selectedPlantId) : "Empty";
  const selectedCode = selectedPlantId ? (codeByPlantId.get(selectedPlantId) ?? "??") : "..";
  const selectedPlant = selectedPlantId ? PlantId.create(selectedPlantId) : null;
  const legendLines = plan.allocations.map((allocation) => {
    const name = capitalize(cropNamesBySlug.get(allocation.plantId) ?? allocation.plantId);
    const code = codeByPlantId.get(allocation.plantId) ?? "??";
    return `${code} ${name} x${allocation.quantity} (${allocation.source})`;
  });

  const inspectOffsets = [
    { label: "Up", row: -1, col: 0 },
    { label: "Right", row: 0, col: 1 },
    { label: "Down", row: 1, col: 0 },
    { label: "Left", row: 0, col: -1 },
  ];

  const inspectLines = inspectOffsets.map((offset) => {
    const neighborRow = cursorRow + offset.row;
    const neighborCol = cursorCol + offset.col;

    if (neighborRow < 0 || neighborRow >= plan.gridSide || neighborCol < 0 || neighborCol >= plan.gridSide) {
      return `${offset.label}: edge`;
    }

    const neighborPlantId = plantByCell[neighborRow]?.[neighborCol];
    if (!neighborPlantId) {
      return `${offset.label}: empty`;
    }

    const neighborPlant = PlantId.create(neighborPlantId);
    const neighborName = capitalize(cropNamesBySlug.get(neighborPlantId) ?? neighborPlantId);
    const neighborCode = codeByPlantId.get(neighborPlantId) ?? "??";

    if (!selectedPlant) {
      return `${offset.label}: ${neighborCode} ${neighborName}`;
    }

    const score = companionKnowledge.getCompatibilityScore(selectedPlant, neighborPlant);
    if (score < 0) {
      return `${offset.label}: ${neighborCode} ${neighborName} -> incompatible (${score})`;
    }

    if (score > 0) {
      return `${offset.label}: ${neighborCode} ${neighborName} -> compatible (+${score})`;
    }

    return `${offset.label}: ${neighborCode} ${neighborName} -> neutral (0)`;
  });

  return (
    <box flexDirection="column" flexGrow={1}>
      <box justifyContent="center" paddingTop={1}>
        <ascii-font font="tiny" text="WIMP" />
      </box>

      <box flexDirection="row" flexGrow={1} justifyContent="center" alignItems="center">
        <box flexDirection="column" alignItems="center">
          <box
            border
            borderStyle="rounded"
            title={` Garden Map (${plan.gridSide}x${plan.gridSide}) `}
            titleAlignment="center"
            flexDirection="column"
            padding={1}
          >
            {rows}
          </box>

          <box marginTop={1} flexDirection="row" justifyContent="center">
            <text
              attributes={TextAttributes.DIM}
            >{`Position: (${cursorRow + 1}, ${cursorCol + 1}) · Cell: ${selectedCode} ${selectedName}`}</text>
          </box>
        </box>

        <box flexDirection="column" width={42} marginLeft={3}>
          <box border borderStyle="rounded" title="Legend" titleAlignment="center" flexDirection="column" padding={1}>
            {legendLines.map((line) => (
              <text key={line}>{line}</text>
            ))}
          </box>

          <box
            border
            borderStyle="rounded"
            title="Info"
            titleAlignment="center"
            flexDirection="column"
            padding={1}
            marginTop={1}
          >
            <text>{`Area: ${plan.areaM2} m2 (${plan.sideLengthMeters.toFixed(2)}m x ${plan.sideLengthMeters.toFixed(2)}m)`}</text>
            <text>{`Cell size: ${plan.cellSizeMeters.toFixed(2)}m`}</text>
            <text>{`Total plants: ${plan.positions.length}`}</text>
          </box>

          <box
            border
            borderStyle="rounded"
            title="Inspect"
            titleAlignment="center"
            flexDirection="column"
            padding={1}
            marginTop={1}
          >
            {inspectLines.map((line) => (
              <text key={line}>{line}</text>
            ))}
          </box>
        </box>
      </box>

      <box justifyContent="center" paddingBottom={1}>
        <text attributes={TextAttributes.DIM}>↑↓←→ Move · r Restart · q Restart</text>
      </box>
    </box>
  );
}
