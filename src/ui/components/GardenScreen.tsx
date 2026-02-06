import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type React from "react";
import { useState } from "react";
import type { Crop } from "@/crops/domain/aggregates/crop";
import type { Garden } from "@/garden/domain/entities/garden";
import type { PlantingLayoutResult } from "@/planting-intelligence/domain/services/plantingLayoutResult";
import { capitalize } from "@/ui/utils/capitalize";

interface GardenScreenProps {
  garden: Garden;
  layoutResult: PlantingLayoutResult;
  onBack: () => void;
  onQuit: () => void;
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

/* ---------- Sub-components ---------- */

interface GardenCellProps {
  crop: Crop | undefined;
  cropNumber: number;
  isSelected: boolean;
  row: number;
  col: number;
}

function GardenCell({ crop, cropNumber, isSelected, row, col }: GardenCellProps) {
  if (crop) {
    const label = ` ${String(cropNumber).padStart(2, " ")} `;
    const attr = isSelected ? TextAttributes.INVERSE : TextAttributes.BOLD;
    return (
      <text key={`${row}-${col}`} attributes={attr}>
        {label}
      </text>
    );
  }

  const attr = isSelected ? TextAttributes.INVERSE : TextAttributes.DIM;
  return (
    <text key={`${row}-${col}`} attributes={attr}>
      {" .  "}
    </text>
  );
}

interface GardenGridProps {
  garden: Garden;
  cropNumberMap: Map<string, number>;
  cursorRow: number;
  cursorCol: number;
}

function GardenGrid({ garden, cropNumberMap, cursorRow, cursorCol }: GardenGridProps) {
  const dimension = garden.getDimension();

  const rows: React.ReactNode[] = [];
  for (let row = 0; row < dimension; row += 1) {
    const cells: React.ReactNode[] = [];
    for (let col = 0; col < dimension; col += 1) {
      const crop = garden.getCropAt(row, col);
      const cropNumber = crop ? (cropNumberMap.get(crop.getName().getValue()) ?? 0) : 0;
      cells.push(
        <GardenCell
          key={`cell-${row}-${col}`}
          crop={crop}
          cropNumber={cropNumber}
          isSelected={row === cursorRow && col === cursorCol}
          row={row}
          col={col}
        />,
      );
    }
    rows.push(
      <box key={`row-${row}`} flexDirection="row">
        {cells}
      </box>,
    );
  }

  return (
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
  );
}

interface GardenLegendProps {
  cropNumberMap: Map<string, number>;
  cropCountMap: Map<string, number>;
}

function GardenLegend({ cropNumberMap, cropCountMap }: GardenLegendProps) {
  return (
    <box border borderStyle="rounded" title=" Legend " titleAlignment="center" flexDirection="column" padding={1}>
      {Array.from(cropNumberMap.entries()).map(([name, num]) => {
        const count = cropCountMap.get(name) ?? 0;
        return <text key={name}>{`${String(num).padStart(2, " ")}  ${capitalize(name)} x${count}`}</text>;
      })}
    </box>
  );
}

interface GardenInfoProps {
  sizeLabel: string;
  typesCount: number;
  plantedCount: number;
  totalSlots: number;
}

function GardenInfo({ sizeLabel, typesCount, plantedCount, totalSlots }: GardenInfoProps) {
  return (
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
      <text>{`Types:   ${typesCount}`}</text>
      <text>{`Planted: ${plantedCount}/${totalSlots}`}</text>
    </box>
  );
}

interface UnplacedCropsProps {
  crops: Crop[];
}

function UnplacedCrops({ crops }: UnplacedCropsProps) {
  if (crops.length === 0) return null;

  return (
    <box
      border
      borderStyle="rounded"
      title=" Unplaced "
      titleAlignment="center"
      flexDirection="column"
      padding={1}
      marginTop={1}
    >
      {crops.map((crop) => (
        <text key={crop.getName().getValue()} attributes={TextAttributes.DIM}>
          {`x ${capitalize(crop.getName().getValue())}`}
        </text>
      ))}
    </box>
  );
}

/* ---------- Main component ---------- */

export function GardenScreen({ garden, layoutResult, onBack, onQuit }: GardenScreenProps) {
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
    if (key.name === "b") onBack();
    if (key.name === "q") onQuit();
  });

  const cursorCrop = garden.getCropAt(cursorRow, cursorCol);
  const cursorCropName = cursorCrop ? capitalize(cursorCrop.getName().getValue()) : null;

  return (
    <box flexDirection="column" flexGrow={1}>
      <box justifyContent="center" paddingTop={1}>
        <ascii-font font="tiny" text="WIMP" />
      </box>

      <box flexDirection="row" flexGrow={1} justifyContent="center" alignItems="center">
        <box flexDirection="column" alignItems="center">
          <GardenGrid garden={garden} cropNumberMap={cropNumberMap} cursorRow={cursorRow} cursorCol={cursorCol} />

          <box marginTop={1} flexDirection="row" justifyContent="center">
            <text attributes={TextAttributes.DIM}>
              {`Position: (${cursorRow + 1}, ${cursorCol + 1})${cursorCropName ? ` - ${cursorCropName}` : ""}`}
            </text>
          </box>
        </box>

        <box flexDirection="column" width={26} marginLeft={3}>
          <GardenLegend cropNumberMap={cropNumberMap} cropCountMap={cropCountMap} />
          <UnplacedCrops crops={unplacedCrops} />
          <GardenInfo
            sizeLabel={sizeLabel}
            typesCount={cropNumberMap.size}
            plantedCount={cropsInOrder.length}
            totalSlots={dimension * dimension}
          />
        </box>
      </box>

      <box justifyContent="center" paddingBottom={1}>
        <text attributes={TextAttributes.DIM}>{"arrows Move · b Back · q Quit"}</text>
      </box>
    </box>
  );
}
