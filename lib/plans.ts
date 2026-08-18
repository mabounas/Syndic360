// Limites de résidences par organisation selon le plan choisi à l'inscription
// (section "Modèle économique" — Bénévole 1 résidence, Pro 2 résidences).
export const RESIDENCE_LIMIT_BY_PLAN: Record<string, number> = {
  BENEVOLE: 1,
  PRO: 2,
};
const DEFAULT_RESIDENCE_LIMIT = 1;

export function residenceLimitForPlan(plan: string): number {
  return RESIDENCE_LIMIT_BY_PLAN[plan] ?? DEFAULT_RESIDENCE_LIMIT;
}
