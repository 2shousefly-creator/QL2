// Generated from the supplied reference pixels by scripts/assets/extract_rank_badges.py.
// One artwork per existing badge ID; URLs and visible bounds never enter save data.
export const RANK_BADGE_ASSETS = {
  badge_academy: { src: "/assets/rank-badges/hoc-vien.png", outerWidthRatio: 207 / 224 },
  badge_enlisted_1: { src: "/assets/rank-badges/binh-bet.png", outerWidthRatio: 208 / 224 },
  badge_enlisted_2: { src: "/assets/rank-badges/binh-nhi.png", outerWidthRatio: 208 / 224 },
  badge_enlisted_3: { src: "/assets/rank-badges/binh-nhat.png", outerWidthRatio: 208 / 224 },
  badge_nco_1: { src: "/assets/rank-badges/ha-si.png", outerWidthRatio: 208 / 224 },
  badge_nco_2: { src: "/assets/rank-badges/trung-si.png", outerWidthRatio: 208 / 224 },
  badge_nco_3: { src: "/assets/rank-badges/thuong-si.png", outerWidthRatio: 208 / 224 },
  badge_junior_1: { src: "/assets/rank-badges/thieu-uy.png", outerWidthRatio: 204 / 224 },
  badge_junior_2: { src: "/assets/rank-badges/trung-uy.png", outerWidthRatio: 204 / 224 },
  badge_junior_3: { src: "/assets/rank-badges/thuong-uy.png", outerWidthRatio: 205 / 224 },
  badge_junior_4: { src: "/assets/rank-badges/dai-uy.png", outerWidthRatio: 204 / 224 },
  badge_field_1: { src: "/assets/rank-badges/thieu-ta.png", outerWidthRatio: 180 / 224 },
  badge_field_2: { src: "/assets/rank-badges/trung-ta.png", outerWidthRatio: 179 / 224 },
  badge_field_3: { src: "/assets/rank-badges/thuong-ta.png", outerWidthRatio: 180 / 224 },
  badge_field_4: { src: "/assets/rank-badges/dai-ta.png", outerWidthRatio: 179 / 224 },
  badge_general_1: { src: "/assets/rank-badges/thieu-tuong.png", outerWidthRatio: 206 / 224 },
  badge_general_2: { src: "/assets/rank-badges/trung-tuong.png", outerWidthRatio: 206 / 224 },
  badge_general_3: { src: "/assets/rank-badges/thuong-tuong.png", outerWidthRatio: 206 / 224 },
  badge_general_4: { src: "/assets/rank-badges/dai-tuong.png", outerWidthRatio: 206 / 224 },
  badge_endgame_1: { src: "/assets/rank-badges/thong-soai.png", outerWidthRatio: 206 / 224 },
  badge_endgame_grand_marshal: { src: "/assets/rank-badges/dai-thong-soai.png", outerWidthRatio: 206 / 224 },
  badge_endgame_2: { src: "/assets/rank-badges/nguyen-soai.png", outerWidthRatio: 206 / 224 },
  badge_endgame_3: { src: "/assets/rank-badges/dai-nguyen-soai.png", outerWidthRatio: 206 / 224 },
  badge_endgame_4: { src: "/assets/rank-badges/tong-tu-lenh.png", outerWidthRatio: 208 / 224 },
} as const;

export type RankBadgeAssetId = keyof typeof RANK_BADGE_ASSETS;

export const getRankBadgeAsset = (badgeId: string | undefined) =>
  badgeId && Object.prototype.hasOwnProperty.call(RANK_BADGE_ASSETS, badgeId)
    ? RANK_BADGE_ASSETS[badgeId as RankBadgeAssetId]
    : undefined;

// Unknown badges use a neutral square placeholder with the same safe margin.
export const DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO = 208 / 224;
