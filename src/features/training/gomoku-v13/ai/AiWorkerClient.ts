import { BoardPoint, GomokuDifficulty, GomokuMark, Stone } from "../domain/gomokuTypes";
import { SearchEngine } from "./SearchEngine";

export class AiWorkerClient {
  private activeRequestId: string | null = null;

  public async computeMove(
    matchId: string,
    stones: readonly Stone[],
    aiMark: GomokuMark,
    playerMark: GomokuMark,
    difficulty: GomokuDifficulty,
    requestId: string
  ): Promise<{ requestId: string; move: BoardPoint }> {
    this.activeRequestId = requestId;

    return new Promise((resolve) => {
      // Execute asynchronously on microtask queue
      setTimeout(() => {
        if (this.activeRequestId !== requestId) {
          return; // Stale request, ignore
        }

        const move = SearchEngine.selectMove(
          stones,
          aiMark,
          playerMark,
          difficulty,
          difficulty === "easy" ? 400 : difficulty === "medium" ? 1200 : 2500
        );

        if (this.activeRequestId === requestId) {
          resolve({ requestId, move });
        }
      }, 50);
    });
  }

  public cancelActiveRequest(): void {
    this.activeRequestId = null;
  }
}
