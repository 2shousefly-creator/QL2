import { BoardPoint, MatchPhase, Stone } from "../domain/gomokuTypes";

export type GomokuFrameSnapshot = Readonly<{
  frameId: number;
  surfaceRevision: number;
  cameraRevision: number;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
  worldToCss: DOMMatrixReadOnly;
  stones: readonly Stone[];
  lastMove: Stone | null;
  cursor: BoardPoint | null;
  winningLine: readonly BoardPoint[] | null;
  stoneDraws?: ReadonlyMap<number, number>;
  winningHighlight?: Readonly<{
    points: readonly BoardPoint[];
    pulse: number;
  }>;
  phase: MatchPhase;
  isAiThinking?: boolean;
}>;
