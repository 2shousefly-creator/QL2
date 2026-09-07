import type { BoardPoint, GomokuMark } from "../domain/gomokuTypes";
import { BoardCore } from "./BoardCore";
import { MATE } from "./PositionEvaluator";
export type TTEntry = { depth: number; score: number; bound: "EXACT" | "LOWER" | "UPPER"; move?: BoardPoint; signature: string };
export const scoreToTT = (score: number, ply: number): number =>
  score > MATE - 1000 ? score + ply : score < -MATE + 1000 ? score - ply : score;
export const scoreFromTT = (score: number, ply: number): number =>
  score > MATE - 1000 ? score - ply : score < -MATE + 1000 ? score + ply : score;
export class TranspositionTable {
  private entries = new Map<string, TTEntry>();
  private signatureChars = 0;
  constructor(readonly capacity: number) {}
  get size(): number { return this.entries.size; }
  get(board: BoardCore, side: GomokuMark): TTEntry | undefined {
    const e = this.entries.get(board.key(side));
    return e?.signature === board.signature() ? e : undefined;
  }
  set(board: BoardCore, side: GomokuMark, entry: Omit<TTEntry, "signature">): void {
    if (this.capacity <= 0) return;
    const key = board.key(side);
    const signature = board.signature(), maxChars = this.capacity * 128;
    if (signature.length > maxChars) return;
    const previous = this.entries.get(key);
    if (previous) { this.signatureChars -= previous.signature.length; this.entries.delete(key); }
    while (this.entries.size && (this.entries.size >= this.capacity || this.signatureChars + signature.length > maxChars)) {
      const oldest = this.entries.keys().next().value!;
      this.signatureChars -= this.entries.get(oldest)!.signature.length;
      this.entries.delete(oldest);
    }
    this.entries.set(key, { ...entry, signature });
    this.signatureChars += signature.length;
  }
}
