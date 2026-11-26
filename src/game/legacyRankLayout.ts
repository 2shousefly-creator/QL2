import { gameConfig } from "./config";
import { RANK_FAMILIES } from "./rankFamilies";

// Frozen widths of the 216-step layout, used for historical XP and save conversion.
const widths = [1, 2, 2, 4, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10, 12, 12, 12, 12, 14, 16, 18, 20, 1];
export const legacySteps = RANK_FAMILIES.flatMap((family, familyIndex) =>
  Array.from({ length: widths[familyIndex] }, (_, i) => {
    const tier = widths[familyIndex] === 1 ? null : i + 1;
    const displayName = tier ? family.name + " bậc " + tier : family.name;
    return { familyId: family.id, familyIndex, familyName: family.name, tier, displayName, shortName: displayName };
  })
).map((step, rankIndex) => ({ ...step, rankIndex }));

export const legacyFamilyStarts = RANK_FAMILIES.map(family =>
  legacySteps.findIndex(step => step.familyId === family.id)
);

export const legacyXpTotals = [0];
for (let i = 0; i < legacySteps.length - 1; i++) {
  const { base, linear, quadratic } = gameConfig.xpCurve;
  legacyXpTotals.push(legacyXpTotals[i] + Math.round(base + linear * i + quadratic * i * i));
}

export function familyTransitionXp(index: number): number {
  const next = legacyFamilyStarts[index + 1];
  return next === undefined ? 0 : legacyXpTotals[next] - legacyXpTotals[legacyFamilyStarts[index]];
}
