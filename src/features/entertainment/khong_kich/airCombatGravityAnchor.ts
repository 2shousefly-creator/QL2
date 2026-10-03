/** Shared by damage, crowd control, AI, tooltips and both renderers. */
export const gravityAnchorValues = (rank: number) => {
  const index = Math.max(0, Math.min(4, rank - 1));
  return {
    radius: [70, 80, 90, 100, 110][index],
    collapse: [1.5, 1.75, 2, 2.25, 2.5][index],
    tickDamage: .4,
    projectileLimit: rank >= 2 ? 10 : 0,
  };
};
