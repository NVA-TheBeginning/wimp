import type { SelectOption } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { GrowstuffCrop } from "@/crops/infrastructure/schemas/infrastructure";
import { themeColors } from "@/ui/theme";
import { capitalize } from "@/ui/utils/capitalize";

interface CropSelectionScreenProps {
  crops: GrowstuffCrop[];
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  onConfirm: () => void;
}

export function CropSelectionScreen({ crops, selectedSlugs, onToggle, onConfirm }: CropSelectionScreenProps) {
  const [query, setQuery] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);

  const filtered = crops.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const options: SelectOption[] = filtered.map((c) => ({
    name: `${selectedSlugs.has(c.slug) ? "✓ " : "  "}${capitalize(c.name)}`,
    description: "",
    value: c.slug,
  }));

  const selectHeight = Math.min(filtered.length, 15);

  const handleToggle = (_index: number, option: SelectOption | null) => {
    if (!option?.value) return;
    onToggle(option.value);
  };

  useKeyboard((key) => {
    if (key.name === "escape" && focusSearch) {
      setFocusSearch(false);
      return;
    }
    if (key.name === "tab" && !focusSearch) {
      setFocusSearch(true);
      return;
    }
    if (key.name === "c" && !focusSearch && selectedSlugs.size > 0) {
      onConfirm();
    }
  });

  const selectedCount = selectedSlugs.size;
  const _confirmHint = selectedCount > 0 ? `c Confirm (${selectedCount})` : "";

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
          <span fg={themeColors.primary}>🌱</span> What would you like to plant?
        </text>
      </box>

      <box
        border
        borderStyle="rounded"
        borderColor={focusSearch ? themeColors.focus : themeColors.borderDefault}
        title=" Search "
        titleAlignment="center"
        width={50}
        marginBottom={2}
        backgroundColor={themeColors.bgMedium}
      >
        <input value={query} onChange={setQuery} placeholder="Type to filter..." focused={focusSearch} width={48} />
      </box>

      <box flexDirection="column" alignItems="center">
        <select
          options={options}
          onSelect={handleToggle}
          focused={!focusSearch}
          height={selectHeight}
          width={50}
          showScrollIndicator={true}
        />
      </box>

      <box marginTop={2} flexDirection="column" alignItems="center" gap={1}>
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
            <span fg={themeColors.textSecondary}>Tab</span> Search · <span fg={themeColors.textSecondary}>Esc</span>{" "}
            List · <span fg={themeColors.textSecondary}>↑/↓</span> Navigate ·{" "}
            <span fg={themeColors.textSecondary}>Enter</span> Toggle
          </text>
        </box>
        {selectedCount > 0 && (
          <box
            border
            borderStyle="rounded"
            borderColor={themeColors.borderHighlight}
            padding={1}
            paddingLeft={2}
            paddingRight={2}
            backgroundColor={themeColors.bgAccent}
          >
            <text fg={themeColors.primary}>
              <span fg={themeColors.primary}>✓</span> Press <span fg={themeColors.primaryLight}>c</span> to confirm (
              {selectedCount} selected)
            </text>
          </box>
        )}
      </box>
    </box>
  );
}
