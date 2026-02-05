import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { loadCrops } from "@/crops/infrastructure/apiData";
import type { GrowstuffCrop } from "@/crops/infrastructure/schemas/infrastructure";
import { Garden } from "@/garden/domain/entities/garden";
import type { GardenSize } from "@/garden/domain/value-objects/gardenSize";
import { GardenScreen } from "@/ui/components/GardenScreen";
import { GardenSizeScreen } from "@/ui/components/GardenSizeScreen";

type Step = "crops" | "size" | "garden";

function capitalize(s: string) {
  if (s.length === 0) return s;
  if (s.length === 1) return s.toUpperCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function StartScreen() {
  const [crops, setCrops] = useState<GrowstuffCrop[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const [step, setStep] = useState<Step>("crops");
  const [garden, setGarden] = useState<Garden | null>(null);

  useEffect(() => {
    loadCrops().then((c) => setCrops(c));
  }, []);

  const filtered = crops.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const options: SelectOption[] = filtered.map((c) => ({
    name: `${selectedCrops.has(c.slug) ? "✔ " : "  "}${capitalize(c.name)}`,
    description: "",
    value: c.slug,
  }));

  const selectHeight = Math.min(filtered.length, 15);

  const handleToggle = (_index: number, option: SelectOption | null) => {
    if (!option?.value) return;
    setSelectedCrops((prev) => {
      const next = new Set(prev);
      next.has(option.value) ? next.delete(option.value) : next.add(option.value);
      return next;
    });
  };

  useKeyboard((key) => {
    if (step !== "crops") return;

    if (key.name === "escape" && focusSearch) {
      setFocusSearch(false);
      return;
    }
    if (key.name === "tab" && !focusSearch) {
      setFocusSearch(true);
      return;
    }
    if (key.name === "c" && !focusSearch && selectedCrops.size > 0) {
      setStep("size");
    }
  });

  const handleSizeConfirm = (size: GardenSize) => {
    const newGarden = Garden.create(size);
    setGarden(newGarden);
    setStep("garden");
  };

  const handleSizeBack = () => {
    setStep("crops");
  };

  const handleQuit = () => {
    process.exit(0);
  };

  if (step === "garden" && garden) {
    const cropNames = crops.filter((c) => selectedCrops.has(c.slug)).map((c) => c.name);
    return <GardenScreen garden={garden} cropNames={cropNames} onQuit={handleQuit} />;
  }

  if (step === "size") {
    return <GardenSizeScreen onConfirm={handleSizeConfirm} onBack={handleSizeBack} />;
  }

  if (crops.length === 0) {
    return (
      <box alignItems="center" justifyContent="center" flexGrow={1}>
        <text attributes={TextAttributes.DIM}>Loading crops...</text>
      </box>
    );
  }

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-end">
        <ascii-font font="tiny" text="WIMP" />
        <text attributes={TextAttributes.DIM}>Vegetable Garden Simulator</text>
      </box>
      <text>{""}</text>
      <text>What would you like to plant?</text>
      <text>{""}</text>
      <box border borderStyle="rounded" title="Search" titleAlignment="center" width={40}>
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
      <text>{""}</text>
      <text attributes={TextAttributes.DIM}>{"Tab Search · Esc List · ↑/↓ Navigate · Enter Toggle · c Confirm"}</text>
    </box>
  );
}
