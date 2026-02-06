import type { CliRenderer } from "@opentui/core";
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
import { themeColors } from "@/ui/theme";

type Step = "crops" | "size" | "garden";

export function StartScreen() {
  const [crops, setCrops] = useState<GrowstuffCrop[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<Step>("crops");
  const [garden, setGarden] = useState<Garden | null>(null);
  const [layoutResult, setLayoutResult] = useState<PlantingLayoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const result = plantGarden(crops, selectedCrops, size);
      setGarden(result.garden);
      setLayoutResult(result.layout);
      setError(null); // Clear any previous errors
      setStep("garden");
    } catch (err) {
      // Log error for debugging
      console.error("Garden creation failed:", err);
      // Show user-friendly error message
      setError("Unable to create garden with selected crops. Please try selecting different crops.");
      // Stay on size selection screen
    }
  };

  const handleBack = (target: Step) => () => {
    setStep(target);
  };

  const handleQuit = () => {
    const renderer = (globalThis as { __renderer?: CliRenderer }).__renderer;
    if (renderer) {
      renderer.destroy();
    } else {
      process.exit(0);
    }
  };

  if (step === "garden" && garden && layoutResult) {
    return (
      <GardenScreen garden={garden} layoutResult={layoutResult} onBack={handleBack("crops")} onQuit={handleQuit} />
    );
  }

  if (step === "size") {
    return (
      <GardenSizeScreen
        onConfirm={handleSizeConfirm}
        onBack={handleBack("crops")}
        error={error}
        onClearError={() => setError(null)}
      />
    );
  }

  if (crops.length === 0) {
    return (
      <box alignItems="center" justifyContent="center" flexGrow={1} backgroundColor={themeColors.bgDark}>
        <box flexDirection="column" alignItems="center" gap={2}>
          <ascii-font font="tiny" text="WIMP" color={themeColors.primary} />
          <box
            border
            borderStyle="rounded"
            borderColor={themeColors.borderHighlight}
            padding={2}
            backgroundColor={themeColors.bgMedium}
          >
            <text fg={themeColors.primary}>
              <span fg={themeColors.primary}>●</span> Loading crops...
            </text>
          </box>
        </box>
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
