import { type SelectOption, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { loadCrops } from "@/crops/infrastructure/apiData";
import { JsonCompanionKnowledge } from "@/crops/infrastructure/jsonCompanionKnowledge";
import type { GrowstuffCrop } from "@/crops/infrastructure/schemas/infrastructure";
import {
  type GenerateGardenPlanOutput,
  GenerateGardenPlanUseCase,
} from "@/planting-intelligence/application/use-cases/generateGardenPlan";
import type { CompanionKnowledgePort } from "@/planting-intelligence/ports/out/companionKnowledgePort";
import { GardenScreen } from "@/ui/components/GardenScreen";

let planner: GenerateGardenPlanUseCase | null = null;
let companionKnowledge: CompanionKnowledgePort | null = null;

function getCompanionKnowledge(): CompanionKnowledgePort {
  if (!companionKnowledge) {
    companionKnowledge = new JsonCompanionKnowledge();
  }
  return companionKnowledge;
}

function getPlanner(): GenerateGardenPlanUseCase {
  if (!planner) {
    planner = new GenerateGardenPlanUseCase(getCompanionKnowledge());
  }
  return planner;
}

type FocusZone = "list" | "search" | "area";

function capitalize(s: string) {
  if (s.length === 0) return s;
  if (s.length === 1) return s.toUpperCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function StartScreen() {
  const [crops, setCrops] = useState<GrowstuffCrop[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [plan, setPlan] = useState<GenerateGardenPlanOutput | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [areaM2, setAreaM2] = useState("9");
  const [focusZone, setFocusZone] = useState<FocusZone>("list");

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

  const restartPlan = () => {
    setConfirmed(false);
    setPlan(null);
    setPlanError(null);
    setFocusZone("list");
  };

  useKeyboard((key) => {
    if (confirmed) {
      return;
    }

    if (key.name === "escape" && focusZone !== "list") {
      setFocusZone("list");
      return;
    }
    if (key.name === "tab") {
      setFocusZone((prev) => {
        if (prev === "list") return "search";
        if (prev === "search") return "area";
        return "list";
      });
      return;
    }
    if (key.name === "c" && focusZone === "list" && selectedCrops.size > 0) {
      try {
        const computed = getPlanner().execute({
          selectedPlantIds: Array.from(selectedCrops),
          areaM2: Number(areaM2.replace(",", ".")),
        });
        setPlan(computed);
        setPlanError(null);
        setConfirmed(true);
      } catch (error) {
        setPlanError(error instanceof Error ? error.message : "Failed to generate garden plan");
        setConfirmed(false);
      }
    }
  });

  if (confirmed && selectedCrops.size > 0 && plan) {
    const bySlug = new Map(crops.map((crop) => [crop.slug, crop.name]));
    return (
      <GardenScreen
        plan={plan}
        cropNamesBySlug={bySlug}
        companionKnowledge={getCompanionKnowledge()}
        onRestart={restartPlan}
      />
    );
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
        <input
          value={query}
          onChange={setQuery}
          placeholder="Type to filter..."
          focused={focusZone === "search"}
          width={38}
        />
      </box>
      <box border borderStyle="rounded" title="Garden area (m2)" titleAlignment="center" width={40} marginTop={1}>
        <input value={areaM2} onChange={setAreaM2} placeholder="Example: 9" focused={focusZone === "area"} width={38} />
      </box>
      <box flexDirection="column" alignItems="center" marginTop={1}>
        <select
          options={options}
          onSelect={handleToggle}
          focused={focusZone === "list"}
          height={selectHeight}
          width={40}
          showScrollIndicator={true}
        />
      </box>
      {planError ? <text attributes={TextAttributes.DIM}>{`Error: ${planError}`}</text> : null}
      <text>{""}</text>
      <text attributes={TextAttributes.DIM}>
        {"Tab cycle focus · Esc list · ↑/↓ navigate · Enter toggle · c compute plan"}
      </text>
    </box>
  );
}
