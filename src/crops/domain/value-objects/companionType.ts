export enum CompanionType {
  HELPS = "HELPS",
  AVOID = "AVOID",
}

export function createHelpful(): CompanionType {
  return CompanionType.HELPS;
}

export function createForbidden(): CompanionType {
  return CompanionType.AVOID;
}
