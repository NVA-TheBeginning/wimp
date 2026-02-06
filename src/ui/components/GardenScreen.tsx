import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useMemo, useState } from "react";
import type { GenerateGardenPlanOutput } from "@/planting-intelligence/application/use-cases/generateGardenPlan";
import { PlantId } from "@/planting-intelligence/domain/value-objects/plantId";
import type { CompanionKnowledgePort } from "@/planting-intelligence/ports/out/companionKnowledgePort";
import { InspectNeighbor } from "@/ui/components/InspectNeighbor";
import { capitalize, truncate } from "@/ui/utils/text";

interface GardenScreenProps {
  plan: GenerateGardenPlanOutput;
  cropNamesBySlug: Map<string, string>;
  companionKnowledge: CompanionKnowledgePort;
  onRestart: () => void;
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
        <text key={`${row}-${col}`} bg="#2E7D32" fg="#FFFFFF" attributes={TextAttributes.BOLD}>
          {cellText}
        </text>
      );
    }

    if (plantId) {
      return (
        <text key={`${row}-${col}`} fg="#81C784">
          {cellText}
        </text>
      );
    }

    return (
      <text key={`${row}-${col}`} fg="#5D4037" attributes={TextAttributes.DIM}>
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
  const selectedName = selectedPlantId
    ? truncate(capitalize(cropNamesBySlug.get(selectedPlantId) ?? selectedPlantId), 20)
    : "Empty";
  const selectedCode = selectedPlantId ? (codeByPlantId.get(selectedPlantId) ?? "??") : "..";
  const selectedPlant = selectedPlantId ? PlantId.create(selectedPlantId) : null;

  const inspectDirections = [
    { label: "Up", dRow: -1, dCol: 0 },
    { label: "Right", dRow: 0, dCol: 1 },
    { label: "Down", dRow: 1, dCol: 0 },
    { label: "Left", dRow: 0, dCol: -1 },
  ];

  return (
    <box flexDirection="column" flexGrow={1}>
      <box justifyContent="center" paddingTop={1}>
        <ascii-font font="tiny" text="WIMP" color="#4CAF50" />
      </box>

      <box flexDirection="row" flexGrow={1} justifyContent="center" alignItems="center">
        <box flexDirection="column" alignItems="center">
          <box
            border
            borderStyle="rounded"
            borderColor="#4CAF50"
            title={` Garden Map (${plan.gridSide}x${plan.gridSide}) `}
            titleAlignment="center"
            flexDirection="column"
            padding={1}
          >
            {rows}
          </box>

          <box marginTop={1} flexDirection="row" justifyContent="center">
            <text>
              <span fg="#9E9E9E">Position: </span>
              <b fg="#81C784">{`(${cursorRow + 1}, ${cursorCol + 1})`}</b>
              <span fg="#9E9E9E"> · Cell: </span>
              <b fg="#81C784">{`${selectedCode} ${selectedName}`}</b>
            </text>
          </box>
        </box>

        <box flexDirection="column" width={44} marginLeft={3}>
          <box
            border
            borderStyle="rounded"
            borderColor="#2E7D32"
            title="Legend"
            titleAlignment="center"
            flexDirection="column"
            padding={1}
          >
            {plan.allocations.map((allocation) => {
              const name = truncate(capitalize(cropNamesBySlug.get(allocation.plantId) ?? allocation.plantId), 20);
              const code = codeByPlantId.get(allocation.plantId) ?? "??";
              return (
                <text key={allocation.plantId}>
                  <b fg="#81C784">{code}</b>
                  <span fg="#E0E0E0">{` ${name} x${allocation.quantity} (${allocation.source})`}</span>
                </text>
              );
            })}
          </box>

          <box
            border
            borderStyle="rounded"
            borderColor="#8D6E63"
            title="Info"
            titleAlignment="center"
            flexDirection="column"
            padding={1}
            marginTop={1}
          >
            <text>
              <span fg="#9E9E9E">Area: </span>
              <b fg="#81C784">{`${plan.areaM2} m\u00B2`}</b>
              <span fg="#9E9E9E">{` (${plan.sideLengthMeters.toFixed(2)}m x ${plan.sideLengthMeters.toFixed(2)}m)`}</span>
            </text>
            <text>
              <span fg="#9E9E9E">Cell size: </span>
              <b fg="#81C784">{`${plan.cellSizeMeters.toFixed(2)}m`}</b>
            </text>
            <text>
              <span fg="#9E9E9E">Total plants: </span>
              <b fg="#81C784">{`${plan.positions.length}`}</b>
            </text>
          </box>

          <box
            border
            borderStyle="rounded"
            borderColor="#2E7D32"
            title="Inspect"
            titleAlignment="center"
            flexDirection="column"
            padding={1}
            marginTop={1}
          >
            {inspectDirections.map((dir) => (
              <InspectNeighbor
                key={dir.label}
                label={dir.label}
                neighborRow={cursorRow + dir.dRow}
                neighborCol={cursorCol + dir.dCol}
                gridSide={plan.gridSide}
                plantByCell={plantByCell}
                codeByPlantId={codeByPlantId}
                cropNamesBySlug={cropNamesBySlug}
                selectedPlant={selectedPlant}
                companionKnowledge={companionKnowledge}
              />
            ))}
          </box>
        </box>
      </box>

      <box justifyContent="center" paddingBottom={1}>
        <text>
          <b fg="#81C784">↑↓←→</b>
          <span fg="#9E9E9E"> Move </span>
          <b fg="#81C784">r</b>
          <span fg="#9E9E9E"> Restart </span>
          <b fg="#81C784">q</b>
          <span fg="#9E9E9E"> Quit</span>
        </text>
      </box>
    </box>
  );
}
