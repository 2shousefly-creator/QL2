import { JourneyChapterDefinition } from "./types";
import { RANK_STEPS } from "./rankBuilder";
import { RANK_FAMILIES } from "./rankFamilies";

export const JOURNEY_CHAPTERS: JourneyChapterDefinition[] = [
  {
    id: "beginning",
    title: "Chương I: Khởi Đầu",
    shortTitle: "Khởi đầu",
    startRankIndex: 0,
    endRankIndex: 0,
    familyIds: ["academy"],
    themeId: "training_dawn",
  },
  {
    id: "soldier",
    title: "Chương II: Binh Sĩ",
    shortTitle: "Binh sĩ",
    startRankIndex: 1,
    endRankIndex: 3,
    familyIds: ["enlisted_1", "enlisted_2", "enlisted_3"],
    themeId: "simple_barracks",
  },
  {
    id: "nco",
    title: "Chương III: Hạ Sĩ Quan",
    shortTitle: "Hạ sĩ quan",
    startRankIndex: 4,
    endRankIndex: 6,
    familyIds: ["nco_1", "nco_2", "nco_3"],
    themeId: "organized_assembly",
  },
  {
    id: "company_officer",
    title: "Chương IV: Cấp Úy",
    shortTitle: "Cấp úy",
    startRankIndex: 7,
    endRankIndex: 10,
    familyIds: ["junior_1", "junior_2", "junior_3", "junior_4"],
    themeId: "map_room",
  },
  {
    id: "field_officer",
    title: "Chương V: Cấp Tá",
    shortTitle: "Cấp tá",
    startRankIndex: 11,
    endRankIndex: 14,
    familyIds: ["field_1", "field_2", "field_3", "field_4"],
    themeId: "command_room",
  },
  {
    id: "general",
    title: "Chương VI: Cấp Tướng",
    shortTitle: "Cấp tướng",
    startRankIndex: 15,
    endRankIndex: 18,
    familyIds: ["general_1", "general_2", "general_3", "general_4"],
    themeId: "ceremonial_abstract",
  },
  {
    id: "supreme_command",
    title: "Chương VII: Tứ Tinh Thủ Hộ",
    shortTitle: "Tứ Tinh Thủ Hộ",
    startRankIndex: 19,
    endRankIndex: 22,
    familyIds: ["endgame_1", "endgame_grand_marshal", "endgame_2", "endgame_3"],
    themeId: "supreme_obsidian",
  },
  {
    id: "supreme_sovereign",
    title: "Chương VIII: Chỉ Huy Tối Thượng",
    shortTitle: "Chỉ Huy Tối Thượng",
    startRankIndex: 23,
    endRankIndex: 23,
    familyIds: ["endgame_4"],
    themeId: "supreme_sovereign",
  },
];

export function validateJourneyChapterCatalog(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (JOURNEY_CHAPTERS.length !== 8) {
    errors.push(`Expected 8 journey chapters, found ${JOURNEY_CHAPTERS.length}`);
  }

  let expectedStartIndex = 0;
  const assignedFamilies = new Set<string>();

  for (let i = 0; i < JOURNEY_CHAPTERS.length; i++) {
    const chap = JOURNEY_CHAPTERS[i];
    if (chap.startRankIndex !== expectedStartIndex) {
      errors.push(
        `Chapter ${chap.id} startRankIndex mismatch: expected ${expectedStartIndex}, got ${chap.startRankIndex}`
      );
    }
    if (chap.endRankIndex < chap.startRankIndex) {
      errors.push(`Chapter ${chap.id} endRankIndex is less than startRankIndex`);
    }
    expectedStartIndex = chap.endRankIndex + 1;

    for (const famId of chap.familyIds) {
      if (assignedFamilies.has(famId)) {
        errors.push(`Family ${famId} assigned to multiple chapters`);
      }
      assignedFamilies.add(famId);
    }
  }

  if (expectedStartIndex !== 24) {
    errors.push(`Catalog does not end at rankIndex 23, ended at ${expectedStartIndex - 1}`);
  }

  if (RANK_STEPS.length !== 24) {
    errors.push(`Total RANK_STEPS length expected 24, got ${RANK_STEPS.length}`);
  }

  if (assignedFamilies.size !== RANK_FAMILIES.length) {
    errors.push(
      `Assigned families count (${assignedFamilies.size}) does not match RANK_FAMILIES count (${RANK_FAMILIES.length})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
