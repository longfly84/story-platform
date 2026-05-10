export type FactoryMotifBankItem = {
  id: string;
  title: string;
  premiseFamily: string;
  premiseLabel: string;
  evidenceType: string;
  evidenceLabel: string;
  hiddenTruthType: string;
  hiddenTruthLabel: string;
  villainAttackType: string;
  villainAttackLabel: string;
  heroineCounterType: string;
  heroineCounterLabel: string;
  openingArena: string;
  mainArena: string;
  arenaLabel: string;
  publicPressure: string;
  publicPressureLabel: string;
  powerStructure: string;
  powerStructureLabel: string;
  deadlineStyle: string;
  deadlineLabel: string;
  heroineStyleLabel: string;
  promptHint: string;
};

// Placeholder bank kept empty on purpose.
// The current Factory still uses the existing formula/lane pools in factoryStorySeed.ts.
// This file only satisfies the optional motif-bank hook introduced by v36 without changing behavior.
export const FACTORY_MOTIF_BANK_10000: FactoryMotifBankItem[] = [];
