import { BadgeDefinition } from "./types";

export const BADGE_CATALOG: Record<string, BadgeDefinition> = {
  // 1. Học Viên
  academy: {
    id: "badge_academy",
    shape: "square",
    symbol: "smile",
    symbolCount: 1,
    basePalette: "steel",
    framePalette: "#cbd5e1",
    symbolPalette: "#334155",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 2. Binh Bét
  enlisted_1: {
    id: "badge_enlisted_1",
    shape: "square",
    symbol: "horizontalBars",
    symbolCount: 1,
    basePalette: "charcoal",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 3. Binh Nhì
  enlisted_2: {
    id: "badge_enlisted_2",
    shape: "square",
    symbol: "horizontalBars",
    symbolCount: 2,
    basePalette: "charcoal",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 4. Binh Nhất
  enlisted_3: {
    id: "badge_enlisted_3",
    shape: "square",
    symbol: "horizontalBars",
    symbolCount: 3,
    basePalette: "charcoal",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 5. Hạ Sĩ
  nco_1: {
    id: "badge_nco_1",
    shape: "square",
    symbol: "chevrons",
    symbolCount: 1,
    basePalette: "navy",
    framePalette: "#cbd5e1",
    symbolPalette: "#f8fafc",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 6. Trung Sĩ
  nco_2: {
    id: "badge_nco_2",
    shape: "square",
    symbol: "chevrons",
    symbolCount: 2,
    basePalette: "navy",
    framePalette: "#cbd5e1",
    symbolPalette: "#f8fafc",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 7. Thượng Sĩ
  nco_3: {
    id: "badge_nco_3",
    shape: "square",
    symbol: "chevrons",
    symbolCount: 3,
    basePalette: "navy",
    framePalette: "#cbd5e1",
    symbolPalette: "#f8fafc",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 8. Thiếu Úy
  junior_1: {
    id: "badge_junior_1",
    shape: "pentagon",
    symbol: "stars",
    symbolCount: 1,
    starLayout: "center",
    basePalette: "green",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 9. Trung Úy
  junior_2: {
    id: "badge_junior_2",
    shape: "pentagon",
    symbol: "stars",
    symbolCount: 2,
    starLayout: "horizontal2",
    basePalette: "green",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 10. Thượng Úy
  junior_3: {
    id: "badge_junior_3",
    shape: "pentagon",
    symbol: "stars",
    symbolCount: 3,
    starLayout: "triangle3",
    basePalette: "green",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 11. Đại Úy
  junior_4: {
    id: "badge_junior_4",
    shape: "pentagon",
    symbol: "stars",
    symbolCount: 4,
    starLayout: "grid4",
    basePalette: "green",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 12. Thiếu Tá
  field_1: {
    id: "badge_field_1",
    shape: "hexagon",
    symbol: "stars",
    symbolCount: 1,
    starLayout: "center",
    basePalette: "sapphire",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 13. Trung Tá
  field_2: {
    id: "badge_field_2",
    shape: "hexagon",
    symbol: "stars",
    symbolCount: 2,
    starLayout: "horizontal2",
    basePalette: "sapphire",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 14. Thượng Tá
  field_3: {
    id: "badge_field_3",
    shape: "hexagon",
    symbol: "stars",
    symbolCount: 3,
    starLayout: "triangle3",
    basePalette: "sapphire",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 15. Đại Tá
  field_4: {
    id: "badge_field_4",
    shape: "hexagon",
    symbol: "stars",
    symbolCount: 4,
    starLayout: "grid4",
    basePalette: "sapphire",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 16. Thiếu Tướng
  general_1: {
    id: "badge_general_1",
    shape: "heptagon",
    symbol: "stars",
    symbolCount: 1,
    starLayout: "center",
    basePalette: "ruby",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 17. Trung Tướng
  general_2: {
    id: "badge_general_2",
    shape: "heptagon",
    symbol: "stars",
    symbolCount: 2,
    starLayout: "horizontal2",
    basePalette: "ruby",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 18. Thượng Tướng
  general_3: {
    id: "badge_general_3",
    shape: "heptagon",
    symbol: "stars",
    symbolCount: 3,
    starLayout: "triangle3",
    basePalette: "ruby",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 19. Đại Tướng
  general_4: {
    id: "badge_general_4",
    shape: "heptagon",
    symbol: "stars",
    symbolCount: 4,
    starLayout: "grid4",
    basePalette: "ruby",
    framePalette: "#ffffff",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 20. Thống Soái
  endgame_1: {
    id: "badge_endgame_1",
    shape: "octagon",
    symbol: "stars",
    symbolCount: 1,
    starLayout: "center",
    basePalette: "obsidian",
    framePalette: "#f6c945",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 21. Đại Thống Soái
  endgame_grand_marshal: {
    id: "badge_endgame_grand_marshal",
    shape: "octagon",
    symbol: "stars",
    symbolCount: 2,
    starLayout: "horizontal2",
    basePalette: "obsidian",
    framePalette: "#f6c945",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 22. Nguyên Soái
  endgame_2: {
    id: "badge_endgame_2",
    shape: "octagon",
    symbol: "stars",
    symbolCount: 3,
    starLayout: "triangle3",
    basePalette: "obsidian",
    framePalette: "#f6c945",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 23. Đại Nguyên Soái
  endgame_3: {
    id: "badge_endgame_3",
    shape: "octagon",
    symbol: "stars",
    symbolCount: 4,
    starLayout: "grid4",
    basePalette: "obsidian",
    framePalette: "#f6c945",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },

  // 24. Tổng Tư Lệnh
  endgame_4: {
    id: "badge_endgame_4",
    shape: "nonagon",
    symbol: "stars",
    symbolCount: 1,
    starLayout: "center",
    basePalette: "crimson",
    framePalette: "#facc15",
    symbolPalette: "#facc15",
    glossLevel: 3,
    embossDepth: 3,
  },
};
