import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { Garden } from "@/garden/domain/entities/garden";

interface GardenScreenProps {
  garden: Garden;
  cropNames: string[];
  onQuit: () => void;
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function GardenScreen({ garden, cropNames, onQuit }: GardenScreenProps) {
  const dimension = garden.getDimension();
  const sizeLabel = garden.getSize().getValue().toLowerCase();
  const [cursorRow, setCursorRow] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);

  useKeyboard((key) => {
    if (key.name === "up") setCursorRow((r) => Math.max(0, r - 1));
    if (key.name === "down") setCursorRow((r) => Math.min(dimension - 1, r + 1));
    if (key.name === "left") setCursorCol((c) => Math.max(0, c - 1));
    if (key.name === "right") setCursorCol((c) => Math.min(dimension - 1, c + 1));
    if (key.name === "q") onQuit();
  });

  const renderCell = (row: number, col: number) => {
    const isSelected = row === cursorRow && col === cursorCol;
    if (isSelected) {
      return (
        <text key={`${row}-${col}`} attributes={TextAttributes.INVERSE}>
          {"[ ]"}
        </text>
      );
    }
    return (
      <text key={`${row}-${col}`} attributes={TextAttributes.DIM}>
        {" · "}
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
            title={` 🌱 Garden (${dimension}×${dimension}) `}
            titleAlignment="center"
            flexDirection="column"
            padding={1}
          >
            {rows}
          </box>

          <box marginTop={1} flexDirection="row" justifyContent="center">
            <text attributes={TextAttributes.DIM}>{`Position: (${cursorRow + 1}, ${cursorCol + 1})`}</text>
          </box>
        </box>

        <box flexDirection="column" width={26} marginLeft={3}>
          <box
            border
            borderStyle="rounded"
            title=" 📋 Crops "
            titleAlignment="center"
            flexDirection="column"
            padding={1}
          >
            {cropNames.map((name) => (
              <text key={name}>• {capitalize(name)}</text>
            ))}
          </box>

          <box
            border
            borderStyle="rounded"
            title=" ℹ️ Info "
            titleAlignment="center"
            flexDirection="column"
            padding={1}
            marginTop={1}
          >
            <text>{`Size:  ${capitalize(sizeLabel)}`}</text>
            <text>{`Crops: ${cropNames.length}`}</text>
            <text>{`Plots: ${dimension * dimension}`}</text>
          </box>
        </box>
      </box>

      <box justifyContent="center" paddingBottom={1}>
        <text attributes={TextAttributes.DIM}>↑↓←→ Move · Enter Plant · q Quit</text>
      </box>
    </box>
  );
}
