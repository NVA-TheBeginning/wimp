export interface PlantTypeConfig {
  id: number;
  name: string;
  daysToFirstHarvest: number;
  daysToLastHarvest: number;
  lifespan: number;
  companions: string[];
  incompatible: string[];
  scientificName: string;
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
    id: 216,
    name: "Tomato",
    daysToFirstHarvest: 92,
    daysToLastHarvest: 126,
    lifespan: 146,
    companions: ["basil", "carrot", "chives"],
    incompatible: ["potato"],
    scientificName: "Solanum lycopersicum",
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🍅" },
  },
  carrot: {
    id: 37,
    name: "Carrot",
    daysToFirstHarvest: 126,
    daysToLastHarvest: 161,
    lifespan: 126,
    companions: ["tomato", "lettuce", "onion"],
    incompatible: ["dill"],
    scientificName: "Daucus carota",
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🥕" },
  },
  lettuce: {
    id: 113,
    name: "Lettuce",
    daysToFirstHarvest: 35,
    daysToLastHarvest: 105,
    lifespan: 105,
    companions: ["carrot", "radish", "strawberry"],
    incompatible: [],
    scientificName: "Lactuca sativa",
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🥬" },
  },
  potato: {
    id: 164,
    name: "Potato",
    daysToFirstHarvest: 84,
    daysToLastHarvest: 112,
    lifespan: 140,
    companions: ["beans", "corn", "cabbage"],
    incompatible: ["tomato"],
    scientificName: "Solanum tuberosum",
    emoji: { seed: "🌑", sprout: "🌱", growing: "🌿", mature: "🪴", harvestable: "🥔" },
  },
};

export const AVAILABLE_PLANTS = Object.keys(PLANT_DATA);
