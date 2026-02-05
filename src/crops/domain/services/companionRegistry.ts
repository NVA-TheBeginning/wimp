import type { CropName } from "@/crops/domain/value-objects/cropName";

export interface CompanionRegistry {
  isHelpful(crop: CropName, companion: CropName): boolean;
  isForbidden(crop: CropName, companion: CropName): boolean;
  getHelpfulCompanions(crop: CropName): CropName[];
  getForbiddenCompanions(crop: CropName): CropName[];
}
