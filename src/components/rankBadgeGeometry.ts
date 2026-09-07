import type { BadgeDefinition, BadgeShape } from "../game/types";

export type Point = {
  x: number;
  y: number;
};

export type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type RankBadgeVisualFamily =
  | "junior_officer"
  | "field_officer"
  | "general"
  | "guardian"
  | "supreme_commander";

export type RankBadgeOrnament =
  | "small_sprouts"
  | "mature_lower_laurel"
  | "closed_wreath"
  | "five_branch_star_wreath"
  | "none";

export type RankBadgeGeometry = {
  center: Point;
  visualFamily: RankBadgeVisualFamily | null;
  sideCount: number | null;
  outerPoints: Point[];
  outerPointsAttribute: string;
  outerBounds: Bounds;
  outerWidthRatio: number;
  outerHeightRatio: number;
  outerStrokeWidth: number;
  ornament: RankBadgeOrnament;
  safeStarRadius: number;
  starRadius: number;
};

export type LaurelGeometry = {
  stemPath: string;
  leafPaths: string[];
  start?: Point;
  end?: Point;
};

export type StarWreathBranchGeometry = {
  stemPath: string;
  leafPaths: string[];
  start: Point;
  meeting: Point;
  end: Point;
};

export type StarClusterInput = {
  count: 1 | 2 | 3 | 4;
  center: Point;
  availableRadius: number;
  starRadius: number;
};

export type StarClusterGeometry = {
  centers: Point[];
  starRadius: number;
};

export const RANK_BADGE_VIEWBOX_SIZE = 128;
export const RANK_BADGE_CENTER: Point = { x: 64, y: 64 };
export const RANK_BADGE_OUTER_RADIUS = 51.5;
export const RANK_BADGE_OUTER_STROKE_WIDTH = 5;

const LEGACY_SQUARE_BOUNDS: Bounds = {
  minX: 11,
  maxX: 117,
  minY: 11,
  maxY: 117,
};

export const DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO =
  (LEGACY_SQUARE_BOUNDS.maxX - LEGACY_SQUARE_BOUNDS.minX) / RANK_BADGE_VIEWBOX_SIZE;

// Keep the SVG coordinates sourced from the exact same floating-point values
// used for visible bounds and CSS ratios; presentation code does not re-round.
const formatCoordinate = (value: number): string => value.toString();

const formatPoint = (point: Point): string =>
  `${formatCoordinate(point.x)},${formatCoordinate(point.y)}`;

export const pointsToAttribute = (points: Point[]): string => points.map(formatPoint).join(" ");

export const getRegularPolygonPoints = (
  sideCount: number,
  center: Point = RANK_BADGE_CENTER,
  radius = RANK_BADGE_OUTER_RADIUS,
  startAngle = -Math.PI / 2
): Point[] => {
  if (!Number.isInteger(sideCount) || sideCount < 3) {
    throw new Error(`Regular polygon requires at least three sides; received ${sideCount}`);
  }

  return Array.from({ length: sideCount }, (_, index) => {
    const angle = startAngle + (index * Math.PI * 2) / sideCount;
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });
};

export const getVisibleBounds = (points: Point[], strokeWidth = 0): Bounds => {
  if (points.length === 0) return { ...LEGACY_SQUARE_BOUNDS };

  const halfStroke = strokeWidth / 2;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    minX: Math.min(...xs) - halfStroke,
    maxX: Math.max(...xs) + halfStroke,
    minY: Math.min(...ys) - halfStroke,
    maxY: Math.max(...ys) + halfStroke,
  };
};

const SIDE_COUNT_BY_SHAPE: Partial<Record<BadgeShape, number>> = {
  pentagon: 5,
  burst5: 5,
  hexagon: 6,
  burst6: 6,
  heptagon: 7,
  burst7: 7,
  octagon: 8,
  burst8: 8,
  nonagon: 9,
  burst9: 9,
  burst10: 10,
  burst11: 11,
  burst12: 12,
};

const getVisualFamily = (shape: BadgeShape): RankBadgeVisualFamily | null => {
  switch (shape) {
    case "pentagon":
    case "burst5":
      return "junior_officer";
    case "hexagon":
    case "burst6":
      return "field_officer";
    case "heptagon":
    case "burst7":
      return "general";
    case "octagon":
    case "burst8":
      return "guardian";
    case "nonagon":
    case "burst9":
      return "supreme_commander";
    default:
      return null;
  }
};

const getOrnament = (visualFamily: RankBadgeVisualFamily | null): RankBadgeOrnament => {
  switch (visualFamily) {
    case "junior_officer":
      return "small_sprouts";
    case "field_officer":
      return "mature_lower_laurel";
    case "general":
    case "guardian":
      return "closed_wreath";
    case "supreme_commander":
      return "five_branch_star_wreath";
    default:
      return "none";
  }
};

const getStarMetrics = (
  visualFamily: RankBadgeVisualFamily | null
): Pick<RankBadgeGeometry, "safeStarRadius" | "starRadius"> => {
  if (visualFamily === "supreme_commander") {
    return { safeStarRadius: 17, starRadius: 13 };
  }

  if (visualFamily) {
    return { safeStarRadius: 23, starRadius: 7.25 };
  }

  return { safeStarRadius: 30, starRadius: 9.5 };
};

const geometryCache = new Map<BadgeShape, RankBadgeGeometry>();

export const getRankBadgeGeometry = (badge: BadgeDefinition): RankBadgeGeometry => {
  const cached = geometryCache.get(badge.shape);
  if (cached) return cached;

  const sideCount = SIDE_COUNT_BY_SHAPE[badge.shape] ?? null;
  const visualFamily = getVisualFamily(badge.shape);
  const outerPoints = sideCount ? getRegularPolygonPoints(sideCount) : [];
  const outerBounds = sideCount
    ? getVisibleBounds(outerPoints, RANK_BADGE_OUTER_STROKE_WIDTH)
    : { ...LEGACY_SQUARE_BOUNDS };
  const starMetrics = getStarMetrics(visualFamily);

  const geometry: RankBadgeGeometry = {
    center: { ...RANK_BADGE_CENTER },
    visualFamily,
    sideCount,
    outerPoints,
    outerPointsAttribute: pointsToAttribute(outerPoints),
    outerBounds,
    outerWidthRatio: (outerBounds.maxX - outerBounds.minX) / RANK_BADGE_VIEWBOX_SIZE,
    outerHeightRatio: (outerBounds.maxY - outerBounds.minY) / RANK_BADGE_VIEWBOX_SIZE,
    outerStrokeWidth: RANK_BADGE_OUTER_STROKE_WIDTH,
    ornament: getOrnament(visualFamily),
    ...starMetrics,
  };

  geometryCache.set(badge.shape, geometry);
  return geometry;
};

export const getRankBadgeOuterWidthRatio = (badge: BadgeDefinition): number =>
  getRankBadgeGeometry(badge).outerWidthRatio;

export const getFivePointStarPoints = (
  center: Point,
  outerRadius: number,
  innerRadius = outerRadius * 0.44
): string => {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });

  return pointsToAttribute(points);
};

export const getStarCluster = ({
  count,
  center,
  availableRadius,
  starRadius,
}: StarClusterInput): StarClusterGeometry => {
  const horizontalOffset = starRadius * 1.34;
  const triangleHeight = starRadius * 1.48;
  let offsets: Point[];

  switch (count) {
    case 1:
      offsets = [{ x: 0, y: 0 }];
      break;
    case 2:
      offsets = [
        { x: -horizontalOffset, y: 0 },
        { x: horizontalOffset, y: 0 },
      ];
      break;
    case 3:
      offsets = [
        { x: 0, y: -triangleHeight },
        { x: -horizontalOffset, y: triangleHeight / 2 },
        { x: horizontalOffset, y: triangleHeight / 2 },
      ];
      break;
    case 4:
      offsets = [
        { x: -horizontalOffset, y: -horizontalOffset },
        { x: horizontalOffset, y: -horizontalOffset },
        { x: -horizontalOffset, y: horizontalOffset },
        { x: horizontalOffset, y: horizontalOffset },
      ];
      break;
  }

  const requestedExtent = Math.max(
    ...offsets.map((offset) => Math.hypot(offset.x, offset.y) + starRadius)
  );
  const scale = requestedExtent > availableRadius ? availableRadius / requestedExtent : 1;

  return {
    centers: offsets.map((offset) => ({
      x: center.x + offset.x * scale,
      y: center.y + offset.y * scale,
    })),
    starRadius: starRadius * scale,
  };
};

const normalize = (vector: Point): Point => {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
};

export const getLeafPath = (
  base: Point,
  direction: Point,
  length: number,
  halfWidth: number
): string => {
  const unit = normalize(direction);
  const normal = { x: -unit.y, y: unit.x };
  const tip = { x: base.x + unit.x * length, y: base.y + unit.y * length };
  const shoulder = {
    x: base.x + unit.x * length * 0.52,
    y: base.y + unit.y * length * 0.52,
  };
  const leftControl = {
    x: shoulder.x + normal.x * halfWidth,
    y: shoulder.y + normal.y * halfWidth,
  };
  const rightControl = {
    x: shoulder.x - normal.x * halfWidth,
    y: shoulder.y - normal.y * halfWidth,
  };

  return [
    `M ${formatPoint(base)}`,
    `Q ${formatPoint(leftControl)} ${formatPoint(tip)}`,
    `Q ${formatPoint(rightControl)} ${formatPoint(base)}`,
    "Z",
  ].join(" ");
};

export const getClosedWreathGeometry = (): LaurelGeometry => {
  const angles = [106, 128, 150, 172, 194, 216, 238, 258];
  const leafPaths = angles.map((degrees, index) => {
    const angle = (degrees * Math.PI) / 180;
    const radial = { x: Math.cos(angle), y: Math.sin(angle) };
    const tangent = { x: -Math.sin(angle), y: Math.cos(angle) };
    const side = index % 2 === 0 ? 1 : -1;
    const direction = {
      x: tangent.x + radial.x * side * 0.52,
      y: tangent.y + radial.y * side * 0.52,
    };
    const taper = index / (angles.length - 1);
    const length = 7.1 - taper * 3.7;
    const width = 1.85 - taper * 0.85;
    const base = {
      x: RANK_BADGE_CENTER.x + radial.x * 32,
      y: RANK_BADGE_CENTER.y + radial.y * 32,
    };

    return getLeafPath(base, direction, length, width);
  });

  return {
    stemPath: "M 64,96 A 32,32 0 0 1 64,32",
    leafPaths,
    start: { x: 64, y: 96 },
    end: { x: 64, y: 32 },
  };
};

const interpolate = (start: Point, end: Point, amount: number): Point => ({
  x: start.x + (end.x - start.x) * amount,
  y: start.y + (end.y - start.y) * amount,
});

export const getFiveBranchStarWreathGeometry = (): StarWreathBranchGeometry[] => {
  const outerPoints = getRegularPolygonPoints(5, RANK_BADGE_CENTER, 36);
  const innerPoints = getRegularPolygonPoints(5, RANK_BADGE_CENTER, 26.5, -Math.PI / 2 + Math.PI / 5);

  return outerPoints.map((outerStart, index) => {
    const inner = innerPoints[index];
    const outerEnd = outerPoints[(index + 1) % outerPoints.length];
    const segments = [
      { start: outerStart, end: inner },
      { start: inner, end: outerEnd },
    ];
    const leafPaths = segments.flatMap((segment, segmentIndex) => {
      const direction = normalize({
        x: segment.end.x - segment.start.x,
        y: segment.end.y - segment.start.y,
      });
      const normalSign = segmentIndex === 0 ? 1 : -1;

      return [
        getLeafPath(
          interpolate(segment.start, segment.end, 0.38),
          {
            x: direction.x + -direction.y * normalSign * 0.5,
            y: direction.y + direction.x * normalSign * 0.5,
          },
          5,
          1.35
        ),
        getLeafPath(
          interpolate(segment.start, segment.end, 0.68),
          {
            x: direction.x + direction.y * normalSign * 0.4,
            y: direction.y - direction.x * normalSign * 0.4,
          },
          3.8,
          1
        ),
      ];
    });

    return {
      stemPath: `M ${formatPoint(outerStart)} L ${formatPoint(inner)} L ${formatPoint(outerEnd)}`,
      leafPaths,
      start: outerStart,
      meeting: inner,
      end: outerEnd,
    };
  });
};
