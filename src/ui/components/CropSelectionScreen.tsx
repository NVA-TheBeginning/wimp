import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { GrowstuffCrop } from "@/crops/infrastructure/schemas/infrastructure";
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
    name: `${selectedSlugs.has(c.slug) ? "✔ " : "  "}${capitalize(c.name)}`,
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
  const confirmHint = selectedCount > 0 ? `c Confirm (${selectedCount})` : "";

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-end">
        <ascii-font font="tiny" text="WIMP" />
        <text attributes={TextAttributes.DIM}>Vegetable Garden Simulator</text>
      </box>

      <box marginTop={1}>
        <text>What would you like to plant?</text>
      </box>

      <box border borderStyle="rounded" title=" Search " titleAlignment="center" width={40} marginTop={1}>
        <input value={query} onChange={setQuery} placeholder="Type to filter..." focused={focusSearch} width={38} />
      </box>

      <box flexDirection="column" alignItems="center" marginTop={1}>
        <select
          options={options}
          onSelect={handleToggle}
          focused={!focusSearch}
          height={selectHeight}
          width={40}
          showScrollIndicator={true}
        />
      </box>

      <box marginTop={1} flexDirection="row" justifyContent="center">
        <text attributes={TextAttributes.DIM}>{"Tab Search · Esc List · ↑/↓ Navigate · Enter Toggle"}</text>
        {selectedCount > 0 && <text attributes={TextAttributes.BOLD}>{` · ${confirmHint}`}</text>}
      </box>
    </box>
  );
}
