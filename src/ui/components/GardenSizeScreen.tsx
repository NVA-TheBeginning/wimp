import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { GARDEN_SIZES, GardenSize } from "@/garden/domain/value-objects/gardenSize";

interface GardenSizeScreenProps {
  onConfirm: (size: GardenSize) => void;
  onBack: () => void;
}

const SIZE_LABELS: Record<string, string> = {
  SMALL: "Small (7x7)",
  MEDIUM: "Medium (15x15)",
  LARGE: "Large (30x30)",
};

function getSizeLabel(size: string): string {
  return SIZE_LABELS[size] ?? size;
}

export function GardenSizeScreen({ onConfirm, onBack }: GardenSizeScreenProps) {
  const options: SelectOption[] = GARDEN_SIZES.map((size) => ({
    name: getSizeLabel(size),
    description: "",
    value: size,
  }));

  const handleSelect = (_index: number, option: SelectOption | null) => {
    if (!option?.value) return;
    const gardenSize = GardenSize.create(option.value);
    onConfirm(gardenSize);
  };

  useKeyboard((key) => {
    if (key.name === "escape") {
      onBack();
    }
  });

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-end">
        <ascii-font font="tiny" text="WIMP" />
        <text attributes={TextAttributes.DIM}>Vegetable Garden Simulator</text>
      </box>

      <box marginTop={1}>
        <text>Choose your garden size:</text>
      </box>

      <box flexDirection="column" alignItems="center" marginTop={1}>
        <select options={options} onSelect={handleSelect} focused={true} height={3} width={30} />
      </box>

      <box marginTop={1}>
        <text attributes={TextAttributes.DIM}>{"↑/↓ Navigate · Enter Select · Esc Back"}</text>
      </box>
    </box>
  );
}
