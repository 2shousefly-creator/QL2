import { BoardPoint } from "../domain/gomokuTypes";

export function worldPointToCss(
  point: BoardPoint,
  matrix: DOMMatrixReadOnly
): DOMPoint {
  return new DOMPoint(point.x, point.y).matrixTransform(matrix);
}

export function cssPointToWorld(
  cssX: number,
  cssY: number,
  matrix: DOMMatrixReadOnly
): DOMPoint {
  return new DOMPoint(cssX, cssY).matrixTransform(matrix.inverse());
}
