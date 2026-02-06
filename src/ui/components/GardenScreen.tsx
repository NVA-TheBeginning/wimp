import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { Crop } from "@/crops/domain/aggregates/crop";
import type { Garden } from "@/garden/domain/entities/garden";
import type { PlantingLayoutResult } from "@/planting-intelligence/domain/services/plantingLayoutResult";

interface GardenScreenProps {
  garden: Garden;
  layoutResult: PlantingLayoutResult;
  onQuit: () => void;
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildCropNumberMap(crops: Crop[]): Map<string, number> {
  const seen = new Map<string, number>();
  let counter = 1;
  for (const crop of crops) {
    const name = crop.getName().getValue();
    if (!seen.has(name)) {
      seen.set(name, counter);
      counter += 1;
    }
  }
  return seen;
}

function buildCropCountMap(crops: Crop[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const crop of crops) {
    const name = crop.getName().getValue();
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
}

export function GardenScreen({ garden, layoutResult, onQuit }: GardenScreenProps) {
  const dimension = garden.getDimension();
  const sizeLabel = garden.getSize().getValue().toLowerCase();
  const [cursorRow, setCursorRow] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);

  const cropsInOrder = layoutResult.getCropsInOrder();
  const unplacedCrops = layoutResult.getUnplacedCrops();
  const cropNumberMap = buildCropNumberMap(cropsInOrder);
  const cropCountMap = buildCropCountMap(cropsInOrder);

  useKeyboard((key) => {
    if (key.name === "up") setCursorRow((r) => Math.max(0, r - 1));
    if (key.name === "down") setCursorRow((r) => Math.min(dimension - 1, r + 1));
    if (key.name === "left") setCursorCol((c) => Math.max(0, c - 1));
    if (key.name === "right") setCursorCol((c) => Math.min(dimension - 1, c + 1));
    if (key.name === "q") onQuit();
  });

  const renderCell = (row: number, col: number) => {
    const crop = garden.getCropAt(row, col);
    const isSelected = row === cursorRow && col === cursorCol;

    if (crop) {
      const num = cropNumberMap.get(crop.getName().getValue()) ?? 0;
      const label = ` ${String(num).padStart(2, " ")} `;

      if (isSelected) {
        return (
          <text key={`${row}-${col}`} attributes={TextAttributes.INVERSE}>
            {label}
          </text>
        );
      }
      return (
        <text key={`${row}-${col}`} attributes={TextAttributes.BOLD}>
          {label}
        </text>
      );
    }

    if (isSelected) {
      return (
        <text key={`${row}-${col}`} attributes={TextAttributes.INVERSE}>
          {" .  "}
        </text>
      );
    }
    return (
      <text key={`${row}-${col}`} attributes={TextAttributes.DIM}>
        {" .  "}
      </text>
    );
  };

  const renderRow = (row: number) => {
    const cells = Array.from({ length: dimension }, (_, col) => renderCell(row, col));
    return (
      <box key={`row-${row}`} flexDirection="row">
        {cells}
      </box>
    );
  };

  const rows = Array.from({ length: dimension }, (_, row) => renderRow(row));

  const cursorCrop = garden.getCropAt(cursorRow, cursorCol);
  const cursorCropName = cursorCrop ? capitalize(cursorCrop.getName().getValue()) : null;

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
            title={` Garden (${dimension}x${dimension}) `}
            titleAlignment="center"
            flexDirection="column"
            padding={1}
          >
            {rows}
          </box>

          <box marginTop={1} flexDirection="row" justifyContent="center">
            <text attributes={TextAttributes.DIM}>
              {`Position: (${cursorRow + 1}, ${cursorCol + 1})${cursorCropName ? ` - ${cursorCropName}` : ""}`}
            </text>
          </box>
        </box>

        <box flexDirection="column" width={26} marginLeft={3}>
          <box border borderStyle="rounded" title=" Legend " titleAlignment="center" flexDirection="column" padding={1}>
            {Array.from(cropNumberMap.entries()).map(([name, num]) => {
              const count = cropCountMap.get(name) ?? 0;
              return <text key={name}>{`${String(num).padStart(2, " ")}  ${capitalize(name)} x${count}`}</text>;
            })}
          </box>

          {unplacedCrops.length > 0 && (
            <box
              border
              borderStyle="rounded"
              title=" Unplaced "
              titleAlignment="center"
              flexDirection="column"
              padding={1}
              marginTop={1}
            >
              {unplacedCrops.map((crop) => (
                <text key={crop.getName().getValue()} attributes={TextAttributes.DIM}>
                  {`x ${capitalize(crop.getName().getValue())}`}
                </text>
              ))}
            </box>
          )}

          <box
            border
            borderStyle="rounded"
            title=" Info "
            titleAlignment="center"
            flexDirection="column"
            padding={1}
            marginTop={1}
          >
            <text>{`Size:    ${capitalize(sizeLabel)}`}</text>
            <text>{`Types:   ${cropNumberMap.size}`}</text>
            <text>{`Planted: ${cropsInOrder.length}/${dimension * dimension}`}</text>
          </box>
        </box>
      </box>

      <box justifyContent="center" paddingBottom={1}>
        <text attributes={TextAttributes.DIM}>{"arrows Move | q Quit"}</text>
      </box>
    </box>
  );
}
