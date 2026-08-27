import { RANK_FAMILIES } from "../../../game/rankFamilies";
import type { BadgeDefinition, RankFamily } from "../../../game/types";

export type UniformVisualGroup =
  | "academy"
  | "enlisted"
  | "nco"
  | "junior_officer"
  | "field_officer"
  | "general"
  | "endgame"
  | "supreme";

export type ShoulderMarkType = "none" | "bar" | "chevron" | "star" | "supreme_star";
export type UniformCollarStyle = "simple" | "service" | "officer" | "ceremonial" | "supreme";
export type UniformLapelStyle = "none" | "narrow" | "wide" | "ceremonial";

export type ShoulderPalette = {
  background: string;
  backgroundDeep: string;
  highlight: string;
  border: string;
  mark: string;
  glow: string;
};

export type UniformPalette = {
  fabric: string;
  fabricLight: string;
  fabricDark: string;
  panel: string;
  trim: string;
  metal: string;
  stitch: string;
};

export type UniformArtConfig = {
  familyId: string;
  visualGroup: UniformVisualGroup;
  groupLabel: string;
  variantLevel: number;
  variantCount: number;
  shoulderMarkType: ShoulderMarkType;
  shoulderMarkCount: number;
  shoulderPalette: ShoulderPalette;
  palette: UniformPalette;
  collarStyle: UniformCollarStyle;
  lapelStyle: UniformLapelStyle;
  trimLevel: number;
  formalityLevel: number;
  ornamentLevel: number;
  buttonCount: number;
};

type UniformGroupSpec = {
  id: UniformVisualGroup;
  label: string;
  familyIds: readonly string[];
  palette: UniformPalette;
  collarStyle: UniformCollarStyle;
  lapelStyle: UniformLapelStyle;
  baseTrimLevel: number;
  baseFormalityLevel: number;
  baseOrnamentLevel: number;
  baseButtonCount: number;
};

const BADGE_PALETTE_COLORS: Record<string, Omit<ShoulderPalette, "border" | "mark">> = {
  steel: {
    background: "#cbd5e1",
    backgroundDeep: "#64748b",
    highlight: "#f8fafc",
    glow: "rgba(226, 232, 240, 0.42)",
  },
  charcoal: {
    background: "#334155",
    backgroundDeep: "#020617",
    highlight: "#64748b",
    glow: "rgba(148, 163, 184, 0.30)",
  },
  navy: {
    background: "#1e293b",
    backgroundDeep: "#020617",
    highlight: "#475569",
    glow: "rgba(100, 116, 139, 0.34)",
  },
  green: {
    background: "#15803d",
    backgroundDeep: "#052e16",
    highlight: "#22c55e",
    glow: "rgba(34, 197, 94, 0.34)",
  },
  sapphire: {
    background: "#1d4ed8",
    backgroundDeep: "#172554",
    highlight: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.36)",
  },
  ruby: {
    background: "#be123c",
    backgroundDeep: "#4c0519",
    highlight: "#fb7185",
    glow: "rgba(244, 63, 94, 0.38)",
  },
  obsidian: {
    background: "#334155",
    backgroundDeep: "#020617",
    highlight: "#64748b",
    glow: "rgba(250, 204, 21, 0.32)",
  },
  crimson: {
    background: "#dc2626",
    backgroundDeep: "#450a0a",
    highlight: "#f87171",
    glow: "rgba(250, 204, 21, 0.48)",
  },
};

const GROUP_SPECS: readonly UniformGroupSpec[] = [
  {
    id: "academy",
    label: "Học Viên",
    familyIds: ["academy"],
    palette: {
      fabric: "#52665d",
      fabricLight: "#70857a",
      fabricDark: "#26352f",
      panel: "#40534a",
      trim: "#cbd5e1",
      metal: "#dbe4e8",
      stitch: "#8fa198",
    },
    collarStyle: "simple",
    lapelStyle: "none",
    baseTrimLevel: 0,
    baseFormalityLevel: 0,
    baseOrnamentLevel: 0,
    baseButtonCount: 3,
  },
  {
    id: "enlisted",
    label: "Binh Sĩ",
    familyIds: ["enlisted_1", "enlisted_2", "enlisted_3"],
    palette: {
      fabric: "#405942",
      fabricLight: "#5f765f",
      fabricDark: "#1d3021",
      panel: "#334b36",
      trim: "#cbd5e1",
      metal: "#e2e8f0",
      stitch: "#7f977f",
    },
    collarStyle: "service",
    lapelStyle: "none",
    baseTrimLevel: 0,
    baseFormalityLevel: 1,
    baseOrnamentLevel: 0,
    baseButtonCount: 4,
  },
  {
    id: "nco",
    label: "Hạ Sĩ Quan",
    familyIds: ["nco_1", "nco_2", "nco_3"],
    palette: {
      fabric: "#31475a",
      fabricLight: "#4d667a",
      fabricDark: "#142433",
      panel: "#253b4e",
      trim: "#dbeafe",
      metal: "#e2e8f0",
      stitch: "#7890a3",
    },
    collarStyle: "service",
    lapelStyle: "narrow",
    baseTrimLevel: 1,
    baseFormalityLevel: 2,
    baseOrnamentLevel: 0,
    baseButtonCount: 4,
  },
  {
    id: "junior_officer",
    label: "Cấp Úy",
    familyIds: ["junior_1", "junior_2", "junior_3", "junior_4"],
    palette: {
      fabric: "#1f5a39",
      fabricLight: "#34734d",
      fabricDark: "#0a2d1b",
      panel: "#17482d",
      trim: "#facc15",
      metal: "#fde68a",
      stitch: "#6f987d",
    },
    collarStyle: "officer",
    lapelStyle: "narrow",
    baseTrimLevel: 1,
    baseFormalityLevel: 2,
    baseOrnamentLevel: 1,
    baseButtonCount: 5,
  },
  {
    id: "field_officer",
    label: "Cấp Tá",
    familyIds: ["field_1", "field_2", "field_3", "field_4"],
    palette: {
      fabric: "#1d3f7a",
      fabricLight: "#315a9d",
      fabricDark: "#0c1e46",
      panel: "#183568",
      trim: "#facc15",
      metal: "#fde68a",
      stitch: "#6f86b4",
    },
    collarStyle: "officer",
    lapelStyle: "wide",
    baseTrimLevel: 2,
    baseFormalityLevel: 3,
    baseOrnamentLevel: 1,
    baseButtonCount: 5,
  },
  {
    id: "general",
    label: "Cấp Tướng",
    familyIds: ["general_1", "general_2", "general_3", "general_4"],
    palette: {
      fabric: "#781d34",
      fabricLight: "#9f3150",
      fabricDark: "#360817",
      panel: "#65172b",
      trim: "#facc15",
      metal: "#fef3c7",
      stitch: "#b56b7d",
    },
    collarStyle: "ceremonial",
    lapelStyle: "wide",
    baseTrimLevel: 2,
    baseFormalityLevel: 4,
    baseOrnamentLevel: 2,
    baseButtonCount: 6,
  },
  {
    id: "endgame",
    label: "Nghi Lễ Tối Cao",
    familyIds: ["endgame_1", "endgame_grand_marshal", "endgame_2", "endgame_3"],
    palette: {
      fabric: "#202737",
      fabricLight: "#3b465d",
      fabricDark: "#080b13",
      panel: "#161c2a",
      trim: "#facc15",
      metal: "#fef3c7",
      stitch: "#70798d",
    },
    collarStyle: "ceremonial",
    lapelStyle: "ceremonial",
    baseTrimLevel: 3,
    baseFormalityLevel: 5,
    baseOrnamentLevel: 3,
    baseButtonCount: 6,
  },
  {
    id: "supreme",
    label: "Tổng Tư Lệnh",
    familyIds: ["endgame_4"],
    palette: {
      fabric: "#681322",
      fabricLight: "#a1283d",
      fabricDark: "#26040b",
      panel: "#4b0c18",
      trim: "#facc15",
      metal: "#fff7cc",
      stitch: "#d07a86",
    },
    collarStyle: "supreme",
    lapelStyle: "ceremonial",
    baseTrimLevel: 4,
    baseFormalityLevel: 5,
    baseOrnamentLevel: 4,
    baseButtonCount: 7,
  },
];

const resolveSymbolColor = (value: string): string => {
  if (value === "goldPlatinum") return "#fff7cc";
  return value;
};

export function deriveShoulderPalette(badge: BadgeDefinition): ShoulderPalette {
  const source = BADGE_PALETTE_COLORS[badge.basePalette] ?? {
    background: badge.basePalette,
    backgroundDeep: "#020617",
    highlight: badge.basePalette,
    glow: "rgba(148, 163, 184, 0.32)",
  };

  return {
    ...source,
    border: badge.framePalette,
    mark: resolveSymbolColor(badge.symbolPalette),
  };
}

function getShoulderMark(family: RankFamily): Pick<UniformArtConfig, "shoulderMarkType" | "shoulderMarkCount"> {
  if (family.id === "academy") {
    return { shoulderMarkType: "none", shoulderMarkCount: 0 };
  }
  if (family.id === "endgame_4") {
    return { shoulderMarkType: "supreme_star", shoulderMarkCount: 1 };
  }
  if (family.badge.symbol === "horizontalBars") {
    return { shoulderMarkType: "bar", shoulderMarkCount: family.badge.symbolCount };
  }
  if (family.badge.symbol === "chevrons") {
    return { shoulderMarkType: "chevron", shoulderMarkCount: family.badge.symbolCount };
  }
  return { shoulderMarkType: "star", shoulderMarkCount: family.badge.symbolCount };
}

function createUniformConfig(family: RankFamily): UniformArtConfig {
  const group = GROUP_SPECS.find((candidate) => candidate.familyIds.includes(family.id)) ?? GROUP_SPECS[0];
  const variantLevel = Math.max(1, group.familyIds.indexOf(family.id) + 1);
  const shoulderMark = getShoulderMark(family);

  return {
    familyId: family.id,
    visualGroup: group.id,
    groupLabel: group.label,
    variantLevel,
    variantCount: group.familyIds.length,
    ...shoulderMark,
    shoulderPalette: deriveShoulderPalette(family.badge),
    palette: group.palette,
    collarStyle: group.collarStyle,
    lapelStyle: group.lapelStyle,
    trimLevel: Math.min(4, group.baseTrimLevel + variantLevel - 1),
    formalityLevel: Math.min(5, group.baseFormalityLevel + variantLevel - 1),
    ornamentLevel: Math.min(4, group.baseOrnamentLevel + Math.floor((variantLevel - 1) / 2)),
    buttonCount: Math.min(7, group.baseButtonCount + variantLevel - 1),
  };
}

export const UNIFORM_ART_CATALOG: Record<string, UniformArtConfig> = Object.fromEntries(
  RANK_FAMILIES.map((family) => [family.id, createUniformConfig(family)])
);

export function getUniformArtConfig(familyId: string): UniformArtConfig {
  return UNIFORM_ART_CATALOG[familyId] ?? UNIFORM_ART_CATALOG.academy;
}
