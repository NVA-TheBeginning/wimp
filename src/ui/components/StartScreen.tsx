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
import { capitalize, truncate } from "@/ui/utils/text";

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
    name: `${selectedCrops.has(c.slug) ? "● " : "  "}${truncate(capitalize(c.name), 34)}`,
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
    if (confirmed) return;

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
        <text fg="#81C784">Loading crops...</text>
      </box>
    );
  }

  return (
    <box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-end">
        <ascii-font font="tiny" text="WIMP" color="#4CAF50" />
        <text fg="#81C784">Vegetable Garden Simulator</text>
      </box>
      <text fg="#E0E0E0" attributes={TextAttributes.BOLD} marginTop={1}>
        What would you like to plant?
      </text>
      <box
        border
        borderStyle="rounded"
        borderColor={focusZone === "search" ? "#4CAF50" : "#2E7D32"}
        title="Search"
        titleAlignment="center"
        width={40}
        marginTop={1}
      >
        <input
          value={query}
          onChange={setQuery}
          placeholder="Type to filter..."
          focused={focusZone === "search"}
          width={38}
          cursorColor="#FFFFFF"
          placeholderColor="#9E9E9E"
          textColor="#E0E0E0"
        />
      </box>
      <box
        border
        borderStyle="rounded"
        borderColor={focusZone === "area" ? "#4CAF50" : "#2E7D32"}
        title="Garden area (m2)"
        titleAlignment="center"
        width={40}
        marginTop={1}
      >
        <input
          value={areaM2}
          onChange={setAreaM2}
          placeholder="Example: 9"
          focused={focusZone === "area"}
          width={38}
          cursorColor="#FFFFFF"
          placeholderColor="#9E9E9E"
          textColor="#E0E0E0"
        />
      </box>
      <box flexDirection="column" alignItems="center" marginTop={1}>
        <select
          options={options}
          onSelect={handleToggle}
          focused={focusZone === "list"}
          height={selectHeight}
          width={40}
          showScrollIndicator={true}
          selectedBackgroundColor="#2E7D32"
          selectedTextColor="#FFFFFF"
          textColor="#E0E0E0"
        />
      </box>
      {planError ? (
        <text fg="#EF5350" attributes={TextAttributes.BOLD}>
          {`Error: ${planError}`}
        </text>
      ) : null}
      <text marginTop={1}>
        <b fg="#81C784">Tab</b>
        <span fg="#9E9E9E"> cycle focus </span>
        <b fg="#81C784">Esc</b>
        <span fg="#9E9E9E"> list </span>
        <b fg="#81C784">↑↓</b>
        <span fg="#9E9E9E"> navigate </span>
        <b fg="#81C784">Enter</b>
        <span fg="#9E9E9E"> toggle </span>
        <b fg="#81C784">c</b>
        <span fg="#9E9E9E"> compute plan</span>
      </text>
    </box>
  );
}
