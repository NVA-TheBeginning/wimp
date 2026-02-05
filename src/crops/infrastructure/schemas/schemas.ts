export const gardenSizeEnum = ["SMALL", "MEDIUM", "LARGE"] as const;
export type GardenSize = (typeof gardenSizeEnum)[number];
