import { getFiveBranchStarWreathGeometry, getClosedWreathGeometry, getRankBadgeGeometry, getStarCluster } from "../src/components/rankBadgeGeometry";
import { BADGE_CATALOG } from "../src/game/badgeCatalog";
import { RANK_FAMILIES } from "../src/game/rankFamilies";
import type { RankBadgeOrnament } from "../src/components/rankBadgeGeometry";
import type { StarLayout } from "../src/game/types";

type ExpectedBadge = readonly [
  id: string,
  sides: number,
  stars: 1 | 2 | 3 | 4,
  layout: StarLayout,
  ornament: RankBadgeOrnament,
  tiers: number
];

const EXPECTED_BADGES: ExpectedBadge[] = [
  ["junior_1", 5, 1, "center", "small_sprouts", 8],
  ["junior_2", 5, 2, "horizontal2", "small_sprouts", 8],
  ["junior_3", 5, 3, "triangle3", "small_sprouts", 8],
  ["junior_4", 5, 4, "grid4", "small_sprouts", 8],
  ["field_1", 6, 1, "center", "mature_lower_laurel", 10],
  ["field_2", 6, 2, "horizontal2", "mature_lower_laurel", 10],
  ["field_3", 6, 3, "triangle3", "mature_lower_laurel", 10],
  ["field_4", 6, 4, "grid4", "mature_lower_laurel", 10],
  ["general_1", 7, 1, "center", "closed_wreath", 12],
  ["general_2", 7, 2, "horizontal2", "closed_wreath", 12],
  ["general_3", 7, 3, "triangle3", "closed_wreath", 12],
  ["general_4", 7, 4, "grid4", "closed_wreath", 12],
  ["endgame_1", 8, 1, "center", "closed_wreath", 14],
  ["endgame_grand_marshal", 8, 2, "horizontal2", "closed_wreath", 16],
  ["endgame_2", 8, 3, "triangle3", "closed_wreath", 18],
  ["endgame_3", 8, 4, "grid4", "closed_wreath", 20],
  ["endgame_4", 9, 1, "center", "five_branch_star_wreath", 1],
];

const EPSILON = 1e-9;

const assert: (condition: unknown, message: string) => asserts condition = (
  condition,
  message
) => {
  if (!condition) throw new Error(message);
};

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

const rows = EXPECTED_BADGES.map(([id, sides, stars, layout, ornament, tiers]) => {
  const badge = BADGE_CATALOG[id];
  const family = RANK_FAMILIES.find((item) => item.id === id);
  assert(badge, `Thiếu BadgeDefinition cho ${id}`);
  assert(family, `Thiếu RankFamily cho ${id}`);

  const geometry = getRankBadgeGeometry(badge);
  assert(geometry.sideCount === sides, `${id}: sai số cạnh`);
  assert(geometry.outerPoints.length === sides, `${id}: sai số đỉnh`);
  assert(badge.symbolCount === stars, `${id}: sai số sao`);
  assert(badge.starLayout === layout, `${id}: sai bố cục sao`);
  assert(geometry.ornament === ornament, `${id}: sai ornament`);
  assert(family.tierCount === tiers, `${id}: tierCount đã thay đổi`);

  const edgeLengths = geometry.outerPoints.map((point, index) =>
    distance(point, geometry.outerPoints[(index + 1) % geometry.outerPoints.length])
  );
  const edgeSpread = Math.max(...edgeLengths) - Math.min(...edgeLengths);
  assert(edgeSpread <= EPSILON, `${id}: đa giác không đều`);
  assert(
    geometry.outerBounds.minX >= 0 &&
      geometry.outerBounds.minY >= 0 &&
      geometry.outerBounds.maxX <= 128 &&
      geometry.outerBounds.maxY <= 128,
    `${id}: viền ngoài bị clip khỏi viewBox`
  );

  const cluster = getStarCluster({
    count: badge.symbolCount,
    center: geometry.center,
    availableRadius: geometry.safeStarRadius,
    starRadius: geometry.starRadius,
  });
  const centroid = cluster.centers.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 }
  );
  centroid.x /= cluster.centers.length;
  centroid.y /= cluster.centers.length;
  assert(distance(centroid, geometry.center) <= EPSILON, `${id}: cụm sao lệch tâm`);

  cluster.centers.forEach((center, index) => {
    cluster.centers.slice(index + 1).forEach((otherCenter) => {
      assert(
        distance(center, otherCenter) > cluster.starRadius * 2,
        `${id}: các sao chồng lên nhau`
      );
    });
  });

  const furthestStarExtent = Math.max(
    ...cluster.centers.map((center) => distance(center, geometry.center) + cluster.starRadius)
  );
  assert(
    furthestStarExtent <= geometry.safeStarRadius + EPSILON,
    `${id}: cụm sao vượt vùng an toàn của ornament`
  );

  return {
    id,
    sides,
    stars,
    layout,
    tiers,
    edgeSpread: edgeSpread.toExponential(2),
    centroid: `${centroid.x.toFixed(2)},${centroid.y.toFixed(2)}`,
    outerWidthRatio: geometry.outerWidthRatio.toFixed(6),
  };
});

const closedWreath = getClosedWreathGeometry();
assert(closedWreath.start?.x === 64 && closedWreath.end?.x === 64, "Hai đầu wreath không chụm tại x=64");
assert(closedWreath.end?.y === 32, "Wreath không khép kín đúng tại đỉnh");

const starWreath = getFiveBranchStarWreathGeometry();
assert(starWreath.length === 5, "Tổng Tư Lệnh không có đúng 5 cành nguyệt quế");
starWreath.forEach((branch, index) => {
  const nextBranch = starWreath[(index + 1) % starWreath.length];
  assert(distance(branch.end, nextBranch.start) <= EPSILON, `Cành ${index + 1} không nối cành kế tiếp`);
  assert(branch.leafPaths.length === 4, `Cành ${index + 1} sai số lá`);
});

console.table(rows);
console.log(
  `Rank badge geometry audit passed: ${rows.length} badges, ${closedWreath.leafPaths.length * 2} closed-wreath leaves, ${starWreath.length} supreme branches.`
);
