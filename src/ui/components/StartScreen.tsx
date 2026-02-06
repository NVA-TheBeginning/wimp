import { TextAttributes } from "@opentui/core";
import { useEffect, useState } from "react";
import { loadCrops } from "@/crops/infrastructure/apiData";
import type { GrowstuffCrop } from "@/crops/infrastructure/schemas/infrastructure";
import { plantGarden } from "@/garden/application/plantGarden";
import type { Garden } from "@/garden/domain/entities/garden";
import type { GardenSize } from "@/garden/domain/value-objects/gardenSize";
import type { PlantingLayoutResult } from "@/planting-intelligence/domain/services/plantingLayoutResult";
import { CropSelectionScreen } from "@/ui/components/CropSelectionScreen";
import { GardenScreen } from "@/ui/components/GardenScreen";
import { GardenSizeScreen } from "@/ui/components/GardenSizeScreen";

type Step = "crops" | "size" | "garden";

export function StartScreen() {
  const [crops, setCrops] = useState<GrowstuffCrop[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<Step>("crops");
  const [garden, setGarden] = useState<Garden | null>(null);
  const [layoutResult, setLayoutResult] = useState<PlantingLayoutResult | null>(null);

  useEffect(() => {
    loadCrops().then((c) => setCrops(c));
  }, []);

  const handleToggle = (slug: string) => {
    setSelectedCrops((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const handleCropConfirm = () => {
    setStep("size");
  };

  const handleSizeConfirm = (size: GardenSize) => {
    const result = plantGarden(crops, selectedCrops, size);
    setGarden(result.garden);
    setLayoutResult(result.layout);
    setStep("garden");
  };

  const handleBack = (target: Step) => () => {
    setStep(target);
  };

  const handleQuit = () => {
    process.exit(0);
  };

  if (step === "garden" && garden && layoutResult) {
    return (
      <GardenScreen garden={garden} layoutResult={layoutResult} onBack={handleBack("crops")} onQuit={handleQuit} />
    );
  }

  if (step === "size") {
    return <GardenSizeScreen onConfirm={handleSizeConfirm} onBack={handleBack("crops")} />;
  }

  if (crops.length === 0) {
    return (
      <box alignItems="center" justifyContent="center" flexGrow={1}>
        <text attributes={TextAttributes.DIM}>Loading crops...</text>
      </box>
    );
  }

  return (
    <CropSelectionScreen
      crops={crops}
      selectedSlugs={selectedCrops}
      onToggle={handleToggle}
      onConfirm={handleCropConfirm}
    />
  );
}
