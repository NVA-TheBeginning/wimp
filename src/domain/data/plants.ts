export interface PlantTypeConfig {
  name: string;
  daysToFirstHarvest: number;
  daysToLastHarvest: number;
  lifespan: number;
  sunNeeds: "full" | "partial";
  companions: string[];
  incompatible: string[];
  emoji: {
    seed: string;
    sprout: string;
    growing: string;
    mature: string;
    harvestable: string;
  };
}

export const PLANT_DATA: Record<string, PlantTypeConfig> = {
  tomato: {
    name: "Tomato",
    daysToFirstHarvest: 92,
    daysToLastHarvest: 126,
    lifespan: 146,
    sunNeeds: "full",
    companions: ["basil", "carrot", "chives"],
    incompatible: ["potato"],
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🍅" },
  },
  carrot: {
    name: "Carrot",
    daysToFirstHarvest: 126,
    daysToLastHarvest: 161,
    lifespan: 126,
    sunNeeds: "full",
    companions: ["tomato", "lettuce", "onion"],
    incompatible: ["dill"],
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🥕" },
  },
  lettuce: {
    name: "Lettuce",
    daysToFirstHarvest: 35,
    daysToLastHarvest: 105,
    lifespan: 105,
    sunNeeds: "partial",
    companions: ["carrot", "radish", "strawberry"],
    incompatible: [],
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🥬" },
  },
  potato: {
    name: "Potato",
    daysToFirstHarvest: 84,
    daysToLastHarvest: 112,
    lifespan: 140,
    sunNeeds: "full",
    companions: ["beans", "corn", "cabbage"],
    incompatible: ["tomato"],
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🥔" },
  },
};

export const AVAILABLE_PLANTS = Object.keys(PLANT_DATA);
