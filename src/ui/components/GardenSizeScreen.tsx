import type { SelectOption } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { GARDEN_SIZES, GardenSize } from "@/garden/domain/value-objects/gardenSize";
import { themeColors } from "@/ui/theme";

interface GardenSizeScreenProps {
  onConfirm: (size: GardenSize) => void;
  onBack: () => void;
  error: string | null;
  onClearError: () => void;
}

const SIZE_LABELS: Record<string, string> = {
  SMALL: "Small (7x7)",
  MEDIUM: "Medium (15x15)",
  LARGE: "Large (30x30)",
};

function getSizeLabel(size: string): string {
  return SIZE_LABELS[size] ?? size;
}

export function GardenSizeScreen({ onConfirm, onBack, error, onClearError }: GardenSizeScreenProps) {
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
      onClearError();
      onBack();
    }
  });

  return (
    <box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      backgroundColor={themeColors.bgDark}
    >
      <box justifyContent="center" alignItems="flex-end" marginBottom={1}>
        <ascii-font font="tiny" text="WIMP" color={themeColors.primary} />
        <text fg={themeColors.textSecondary} marginLeft={2}>
          Vegetable Garden Simulator
        </text>
      </box>

      <box
        border
        borderStyle="rounded"
        borderColor={themeColors.borderHighlight}
        padding={2}
        marginBottom={2}
        backgroundColor={themeColors.bgMedium}
      >
        <text fg={themeColors.primary}>
          <span fg={themeColors.primary}>🌾</span> Choose your garden size:
        </text>
      </box>

      <box flexDirection="column" alignItems="center">
        <select options={options} onSelect={handleSelect} focused={true} height={3} width={40} />
      </box>

      {error && (
        <box marginTop={2}>
          <box
            border
            borderStyle="rounded"
            borderColor={themeColors.textError}
            padding={2}
            backgroundColor={themeColors.bgMedium}
            flexDirection="column"
            alignItems="center"
            gap={1}
            width={50}
          >
            <text fg={themeColors.textError}>
              <span fg={themeColors.textError}>⚠</span> {error}
            </text>
            <box
              border
              borderStyle="rounded"
              borderColor={themeColors.borderDefault}
              padding={1}
              paddingLeft={2}
              paddingRight={2}
              backgroundColor={themeColors.bgLight}
            >
              <text fg={themeColors.textSecondary}>
                Press <span fg={themeColors.primaryLight}>Esc</span> to select different crops
              </text>
            </box>
          </box>
        </box>
      )}

      <box marginTop={2}>
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
            <span fg={themeColors.textSecondary}>↑/↓</span> Navigate · <span fg={themeColors.textSecondary}>Enter</span>{" "}
            Select · <span fg={themeColors.textSecondary}>Esc</span> Back
          </text>
        </box>
      </box>
    </box>
  );
}
