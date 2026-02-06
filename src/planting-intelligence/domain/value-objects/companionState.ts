export enum CompanionState {
  BENEFICIAL = "BENEFICIAL",
  NEUTRAL = "NEUTRAL",
  INCOMPATIBLE = "INCOMPATIBLE",
}

export function createBeneficialState(): CompanionState {
  return CompanionState.BENEFICIAL;
}

export function createNeutralState(): CompanionState {
  return CompanionState.NEUTRAL;
}

export function createIncompatibleState(): CompanionState {
  return CompanionState.INCOMPATIBLE;
}
