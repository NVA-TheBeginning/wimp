import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type React from "react";
import { useState } from "react";
import type { Crop } from "@/crops/domain/aggregates/crop";
import type { Garden } from "@/garden/domain/entities/garden";
import type { PlantingLayoutResult } from "@/planting-intelligence/domain/services/plantingLayoutResult";
import { themeColors } from "@/ui/theme";
import { capitalize } from "@/ui/utils/capitalize";

interface GardenScreenProps {
  garden: Garden;
  layoutResult: PlantingLayoutResult;
  onBack: () => void;
  onQuit: () => void;
}

const CROP_EMOJIS = ["🌱", "🌿", "🥕", "🌾", "🌽", "🥬", "🍅", "🥒", "🫑", "🧅", "🧄", "🥔"];

function buildCropEmojiMap(crops: Crop[]): Map<string, string> {
  const seen = new Map<string, string>();
  let counter = 0;
  for (const crop of crops) {
    const name = crop.getName().getValue();
    if (!seen.has(name)) {
      seen.set(name, CROP_EMOJIS[counter % CROP_EMOJIS.length] ?? "🌱");
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
  cropEmoji: string;
  isSelected: boolean;
  row: number;
  col: number;
}

function GardenCell({ crop, cropEmoji, isSelected, row, col }: GardenCellProps) {
  if (crop) {
    return (
      <text
        key={`${row}-${col}`}
        fg={isSelected ? themeColors.primary : undefined}
        bg={isSelected ? themeColors.bgLight : undefined}
      >
        {` ${cropEmoji} `}
      </text>
    );
  }

  return (
    <text
      key={`${row}-${col}`}
      fg={isSelected ? themeColors.bgDark : themeColors.textDim}
      bg={isSelected ? themeColors.textSecondary : themeColors.bgLight}
      attributes={TextAttributes.DIM}
    >
      {" .  "}
    </text>
  );
}

interface GardenGridProps {
  garden: Garden;
  cropEmojiMap: Map<string, string>;
  cursorRow: number;
  cursorCol: number;
}

function GardenGrid({ garden, cropEmojiMap, cursorRow, cursorCol }: GardenGridProps) {
  const dimension = garden.getDimension();

  const rows: React.ReactNode[] = [];
  for (let row = 0; row < dimension; row += 1) {
    const cells: React.ReactNode[] = [];
    for (let col = 0; col < dimension; col += 1) {
      const crop = garden.getCropAt(row, col);
      const cropEmoji = crop ? (cropEmojiMap.get(crop.getName().getValue()) ?? "🌱") : "";
      cells.push(
        <GardenCell
          key={`cell-${row}-${col}`}
          crop={crop}
          cropEmoji={cropEmoji}
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
      borderColor={themeColors.borderHighlight}
      title={` Garden (${dimension}x${dimension}) `}
      titleAlignment="center"
      flexDirection="column"
      padding={1}
      backgroundColor={themeColors.bgMedium}
    >
      {rows}
    </box>
  );
}

interface GardenLegendProps {
  cropEmojiMap: Map<string, string>;
  cropCountMap: Map<string, number>;
}

function GardenLegend({ cropEmojiMap, cropCountMap }: GardenLegendProps) {
  return (
    <box
      border
      borderStyle="rounded"
      borderColor={themeColors.borderHighlight}
      title=" Legend "
      titleAlignment="center"
      flexDirection="column"
      padding={1}
      backgroundColor={themeColors.bgMedium}
    >
      {Array.from(cropEmojiMap.entries()).map(([name, emoji]) => {
        const count = cropCountMap.get(name) ?? 0;
        return (
          <text key={name} fg={themeColors.primary}>
            <span fg={themeColors.primaryLight}>{emoji}</span>{" "}
            <span fg={themeColors.textPrimary}>{capitalize(name)}</span>{" "}
            <span fg={themeColors.textSecondary}>x{count}</span>
          </text>
        );
      })}
    </box>
  );
}

interface GardenInfoProps {
  sizeLabel: string;
  typesCount: number;
  plantedCount: number;
  totalSlots: number;
  cursorCrop: Crop | undefined;
  cropEmojiMap: Map<string, string>;
}

function GardenInfo({ sizeLabel, typesCount, plantedCount, totalSlots, cursorCrop, cropEmojiMap }: GardenInfoProps) {
  return (
    <box
      border
      borderStyle="rounded"
      borderColor={themeColors.borderDefault}
      title=" Info "
      titleAlignment="center"
      flexDirection="column"
      padding={1}
      marginTop={1}
      backgroundColor={themeColors.bgMedium}
    >
      <text fg={themeColors.textPrimary}>
        <span fg={themeColors.textSecondary}>Size:</span> {capitalize(sizeLabel)}
      </text>
      <text fg={themeColors.textPrimary}>
        <span fg={themeColors.textSecondary}>Types:</span> {typesCount}
      </text>
      <text fg={themeColors.textPrimary}>
        <span fg={themeColors.textSecondary}>Planted:</span>{" "}
        <span fg={themeColors.primary}>
          {plantedCount}/{totalSlots}
        </span>
      </text>

      {cursorCrop && (
        <>
          <box marginTop={1} marginBottom={1} height={1} backgroundColor={themeColors.borderDim} />
          <text fg={themeColors.primaryLight}>
            {cropEmojiMap.get(cursorCrop.getName().getValue())} {capitalize(cursorCrop.getName().getValue())}
          </text>

          {cursorCrop.getCompanions().length > 0 && (
            <>
              <text fg={themeColors.textSecondary} marginTop={1}>
                Buffs:
              </text>
              {cursorCrop.getCompanions().map((companionName) => {
                const emoji = cropEmojiMap.get(companionName.getValue()) ?? "🌱";
                return (
                  <text key={companionName.getValue()} fg={themeColors.primary}>
                    {emoji} {capitalize(companionName.getValue())}
                  </text>
                );
              })}
            </>
          )}
        </>
      )}
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
      borderColor={themeColors.textWarning}
      title=" Unplaced "
      titleAlignment="center"
      flexDirection="column"
      padding={1}
      marginTop={1}
      backgroundColor={themeColors.bgMedium}
    >
      {crops.map((crop) => (
        <text key={crop.getName().getValue()} fg={themeColors.textWarning}>
          <span fg={themeColors.textWarning}>⚠</span> {capitalize(crop.getName().getValue())}
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
  const cropEmojiMap = buildCropEmojiMap(cropsInOrder);
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
    <box flexDirection="column" flexGrow={1} backgroundColor={themeColors.bgDark}>
      <box justifyContent="center" paddingTop={1}>
        <ascii-font font="tiny" text="WIMP" color={themeColors.primary} />
      </box>

      <box flexDirection="row" flexGrow={1} justifyContent="center" alignItems="center">
        <box flexDirection="column" alignItems="center">
          <GardenGrid garden={garden} cropEmojiMap={cropEmojiMap} cursorRow={cursorRow} cursorCol={cursorCol} />

          <box marginTop={1} flexDirection="row" justifyContent="center">
            <box
              border
              borderStyle="rounded"
              borderColor={themeColors.borderDim}
              padding={1}
              paddingLeft={2}
              paddingRight={2}
              backgroundColor={themeColors.bgLight}
            >
              <text fg={themeColors.textSecondary}>
                Position:{" "}
                <span fg={themeColors.primary}>
                  ({cursorRow + 1}, {cursorCol + 1})
                </span>
                {cursorCropName && (
                  <>
                    {" · "}
                    <span fg={themeColors.primaryLight}>{cursorCropName}</span>
                  </>
                )}
              </text>
            </box>
          </box>
        </box>

        <box flexDirection="column" width={26} marginLeft={3}>
          <GardenLegend cropEmojiMap={cropEmojiMap} cropCountMap={cropCountMap} />
          <UnplacedCrops crops={unplacedCrops} />
          <GardenInfo
            sizeLabel={sizeLabel}
            typesCount={cropEmojiMap.size}
            plantedCount={cropsInOrder.length}
            totalSlots={dimension * dimension}
            cursorCrop={cursorCrop}
            cropEmojiMap={cropEmojiMap}
          />
        </box>
      </box>

      <box justifyContent="center" paddingBottom={1}>
        <box
          border
          borderStyle="rounded"
          borderColor={themeColors.borderDim}
          padding={1}
          paddingLeft={2}
          paddingRight={2}
          backgroundColor={themeColors.bgLight}
        >
          <text fg={themeColors.textDim}>
            <span fg={themeColors.textSecondary}>Arrows</span> Move · <span fg={themeColors.textSecondary}>b</span> Back
            · <span fg={themeColors.textSecondary}>q</span> Quit
          </text>
        </box>
      </box>
    </box>
  );
}
