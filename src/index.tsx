import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import type { GrowstuffCrop } from "./domain/schemas/infrastructure";
import { loadCrops } from "./infrastructure/apiData";

function capitalize(s: string) {
  if (s.length === 0) return s;
  if (s.length === 1) return s.toUpperCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function App() {
  const [crops, setCrops] = useState<GrowstuffCrop[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [query, setQuery] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);

  useEffect(() => {
    loadCrops().then((c) => setCrops(c));
  }, []);

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusSearch((f) => !f);
    }
    if (key.name === "space" && !focusSearch && highlightedSlug) {
      setSelectedCrops((prev) => {
        const next = new Set(prev);
        if (next.has(highlightedSlug)) {
          next.delete(highlightedSlug);
        } else {
          next.add(highlightedSlug);
        }
        return next;
      });
    }
  });

  if (confirmed && selectedCrops.size > 0) {
    const names = crops.filter((c) => selectedCrops.has(c.slug)).map((c) => capitalize(c.name));

    return (
      <box alignItems="center" justifyContent="center" flexGrow={1}>
        <box justifyContent="center" alignItems="flex-end">
          <ascii-font font="tiny" text="WIMP" />
          <text attributes={TextAttributes.DIM}>Vegetable Garden Simulator</text>
          <text>{""}</text>
          <text>{`Selected: ${names.join(", ")} (${names.length})`}</text>
        </box>
      </box>
    );
  }

  if (crops.length === 0) {
    return (
      <box alignItems="center" justifyContent="center" flexGrow={1}>
        <text attributes={TextAttributes.DIM}>Loading crops...</text>
      </box>
    );
  }

  const filtered = crops.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const options = filtered.map((crop) => ({
    name: `${selectedCrops.has(crop.slug) ? "✔ " : "  "}${capitalize(crop.name)}`,
    description: crop.scientificName ?? "",
    value: crop.slug,
  }));

  const selectedNames = crops.filter((c) => selectedCrops.has(c.slug)).map((c) => capitalize(c.name));

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-end">
        <ascii-font font="tiny" text="WIMP" />
        <text attributes={TextAttributes.DIM}>Vegetable Garden Simulator</text>
      </box>
      <text>{""}</text>
      <text>What would you like to plant?</text>
      <text>{""}</text>
      <box border borderStyle="rounded" title="Search" titleAlignment="center">
        <input value={query} onChange={setQuery} placeholder="Type to filter..." focused={focusSearch} width={30} />
      </box>
      <box border borderStyle="rounded" title="Pick crops" titleAlignment="center">
        <select
          options={options}
          onChange={(_index, option) => {
            if (option) setHighlightedSlug(option.value as string);
          }}
          onSelect={() => {
            if (selectedCrops.size > 0) {
              setConfirmed(true);
            }
          }}
          showScrollIndicator
          focused={!focusSearch}
        />
      </box>
      {selectedNames.length > 0 && <text>{`Selected: ${selectedNames.join(", ")} (${selectedNames.length})`}</text>}
      <text>{""}</text>
      <text attributes={TextAttributes.DIM}>{"Tab Search · ↑/↓ Navigate · Space Toggle · Enter Confirm"}</text>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
