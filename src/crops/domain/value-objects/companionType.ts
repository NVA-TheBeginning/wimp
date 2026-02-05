export enum CompanionType {
  HELPS = "HELPS",
  AVOID = "AVOID",
  REQUIRED = "REQUIRED",
}

export function createHelpful(): CompanionType {
  return CompanionType.HELPS;
}

export function createForbidden(): CompanionType {
  return CompanionType.AVOID;
}

export function createRequired(): CompanionType {
  return CompanionType.REQUIRED;
}
