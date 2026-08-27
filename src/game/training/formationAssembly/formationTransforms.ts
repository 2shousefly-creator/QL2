import {
  FormationCell,
  FormationOrientation,
  FormationPlacement,
  FormationRound,
  FormationTransformProtocol,
} from "./formationTypes";

export function transformCell(
  cell: FormationCell,
  rows: number,
  columns: number,
  protocol: FormationTransformProtocol
): FormationCell {
  const { row: r, column: c } = cell;
  switch (protocol) {
    case "identity":
      return { row: r, column: c };
    case "rotate90":
      return { row: c, column: rows - 1 - r };
    case "rotate180":
      return { row: rows - 1 - r, column: columns - 1 - c };
    case "mirrorHorizontal":
      return { row: rows - 1 - r, column: c };
    case "mirrorVertical":
      return { row: r, column: columns - 1 - c };
    default:
      return { row: r, column: c };
  }
}

export function transformOrientation(
  orientation: FormationOrientation,
  protocol: FormationTransformProtocol
): FormationOrientation {
  switch (protocol) {
    case "identity":
      return orientation;
    case "rotate90":
      return ((orientation + 90) % 360) as FormationOrientation;
    case "rotate180":
      return ((orientation + 180) % 360) as FormationOrientation;
    case "mirrorHorizontal": {
      if (orientation === 0) return 180;
      if (orientation === 180) return 0;
      return orientation;
    }
    case "mirrorVertical": {
      if (orientation === 90) return 270;
      if (orientation === 270) return 90;
      return orientation;
    }
    default:
      return orientation;
  }
}

export function getProtocolLabel(protocol: FormationTransformProtocol): string {
  switch (protocol) {
    case "identity":
      return "ĐỘI HÌNH NGUYÊN BẢN";
    case "rotate90":
      return "MẬT LỆNH: XOAY 90° THEO CHIỀU KIM ĐỒNG HỒ";
    case "rotate180":
      return "MẬT LỆNH: XOAY 180° XUỐNG DƯỚI";
    case "mirrorHorizontal":
      return "MẬT LỆNH: LẬP ĐỐI XỨNG HÀNG NGANG (LẬT DỌC)";
    case "mirrorVertical":
      return "MẬT LỆNH: LẬP ĐỐI XỨNG HÀNG CỘT (LẬT NGANG)";
    default:
      return "ĐỘI HÌNH NGUYÊN BẢN";
  }
}

export function transformRoundTargets(round: FormationRound): {
  transformedPlacements: FormationPlacement[];
  transformedLockedCells: FormationCell[];
} {
  const { rows, columns, protocol, targetPlacements, lockedCells } = round;

  const transformedPlacements = targetPlacements.map((p) => ({
    pieceId: p.pieceId,
    cell: transformCell(p.cell, rows, columns, protocol),
    orientation: transformOrientation(p.orientation, protocol),
  }));

  const transformedLockedCells = lockedCells.map((c) =>
    transformCell(c, rows, columns, protocol)
  );

  return { transformedPlacements, transformedLockedCells };
}
