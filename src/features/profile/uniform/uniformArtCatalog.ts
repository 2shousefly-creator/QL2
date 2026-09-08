/** PNG layers share one canvas contract; sub-ranks remain in RankTierProgress. */
export type UniformArtConfig = {
  familyId: string;
  groupLabel: string;
  uniformSrc: string;
  shoulderSrc: string;
  shoulderDescription: string;
  glow: string;
};

const GROUPS = [
  { label: "Học Viên", ids: ["academy"], mark: "none", stripes: 0, glow: "rgba(203,213,225,0.18)" },
  { label: "Binh Sĩ", ids: ["enlisted_1", "enlisted_2", "enlisted_3"], mark: "bar", stripes: 0, glow: "rgba(100,116,139,0.2)" },
  { label: "Hạ Sĩ Quan", ids: ["nco_1", "nco_2", "nco_3"], mark: "chevron", stripes: 0, glow: "rgba(100,116,139,0.2)" },
  { label: "Cấp Úy", ids: ["junior_1", "junior_2", "junior_3", "junior_4"], mark: "star", stripes: 1, glow: "rgba(21,128,61,0.24)" },
  { label: "Cấp Tá", ids: ["field_1", "field_2", "field_3", "field_4"], mark: "star", stripes: 2, glow: "rgba(30,58,95,0.26)" },
  { label: "Cấp Tướng", ids: ["general_1", "general_2", "general_3", "general_4"], mark: "star", stripes: 3, glow: "rgba(159,43,59,0.24)" },
  // This order is deliberate: Đại Thống Soái precedes Nguyên Soái.
  { label: "Nghi Lễ Tối Cao", ids: ["endgame_1", "endgame_grand_marshal", "endgame_2", "endgame_3"], mark: "star", stripes: 0, glow: "rgba(202,161,64,0.18)" },
  { label: "Tổng Tư Lệnh", ids: ["endgame_4"], mark: "supreme", stripes: 0, glow: "rgba(196,73,32,0.28)" },
] as const;

export type UniformFamilyId = typeof GROUPS[number]["ids"][number];

function describeShoulder(mark: typeof GROUPS[number]["mark"], count: number, stripes: number): string {
  if (mark === "none") return "nền trắng bạc, không ký hiệu";
  if (mark === "bar") return `${count} vạch vàng dọc gần đầu ngoài`;
  if (mark === "chevron") return `${count} vạch chữ V vàng hướng vào trong`;
  if (mark === "supreme") return "một sao vàng dập nổi cao cấp, nền đỏ cam viền vàng kép dày";
  return `${count} sao vàng${stripes ? ` chèn trên ${stripes} vạch trắng ngang` : ", nền đen viền vàng"}`;
}

export const UNIFORM_ART_CATALOG = Object.fromEntries(
  GROUPS.flatMap((group) => group.ids.map((familyId, index): [string, UniformArtConfig] => [
    familyId,
    {
      familyId,
      groupLabel: group.label,
      uniformSrc: `/assets/uniforms/uniforms/${familyId}.png`,
      shoulderSrc: `/assets/uniforms/shoulder-boards/${familyId}.png`,
      shoulderDescription: `${describeShoulder(group.mark, index + 1, group.stripes)}, có nút đính`,
      glow: group.glow,
    },
  ])),
) as Record<UniformFamilyId, UniformArtConfig>;

export function getUniformArtConfig(familyId: string): UniformArtConfig {
  return Object.hasOwn(UNIFORM_ART_CATALOG, familyId)
    ? UNIFORM_ART_CATALOG[familyId as UniformFamilyId]
    : UNIFORM_ART_CATALOG.academy;
}
