import { DIFFICULTY_PROFILES } from "./DifficultyProfiles";
import { identityOf, type AiRequest, type AiResponse } from "./aiTypes";
import { emptyResult, validRequest, validResponse } from "./WorkerProtocol";

export interface WorkerPort {
  onmessage: ((event: MessageEvent<AiResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror: ((event: MessageEvent) => void) | null;
  postMessage(request: AiRequest): void;
  terminate(): void;
}
type Pending = { request: AiRequest; resolve: (r: AiResponse) => void;
  timer: ReturnType<typeof setTimeout>; best: AiResponse | null };

export class AiWorkerClient {
  private worker: WorkerPort | null = null;
  private pending: Pending | null = null;
  constructor(private createWorker: () => WorkerPort = () =>
    new Worker(new URL("./GomokuWorker.ts", import.meta.url), { type: "module" }),
    private watchdogGraceMs = 1000) {}

  computeMove(request: AiRequest): Promise<AiResponse> {
    this.cancelActiveRequest();
    if (!validRequest(request)) return Promise.resolve({ ...identityOf(request), ...emptyResult("error", "invalid_request"), kind: "result" });
    const snapshot: AiRequest = { ...request, stones: request.stones.map(s => ({ ...s })),
      searchBudget: request.searchBudget ? { ...request.searchBudget } : undefined };
    if (!validRequest(snapshot)) return Promise.resolve({ ...identityOf(snapshot), ...emptyResult("error", "invalid_request"), kind: "result" });
    return new Promise(resolve => {
      const limit = Math.min(DIFFICULTY_PROFILES[snapshot.difficulty].timeMs,
        snapshot.searchBudget?.timeMs ?? Infinity) + this.watchdogGraceMs;
      const timer = setTimeout(() => this.finish("timeout", "watchdog", true), limit);
      this.pending = { request: snapshot, resolve, timer, best: null };
      try {
        this.worker ??= this.createWorker();
        const worker = this.worker, activePending = this.pending;
        this.worker.onmessage = ({ data }) => {
          if (this.worker !== worker || this.pending !== activePending) return;
          const pending = this.pending;
          if (!pending) return;
          if (data?.requestId && data.requestId !== pending.request.requestId) return;
          if (!validResponse(data, pending.request)) { this.finish("error", "invalid_response", true); return; }
          if (data.kind === "progress") {
            if (data.move && (!pending.best || (pending.best.proofStatus !== "proven_win" &&
              (data.proofStatus === "proven_win" || data.completedDepth >= pending.best.completedDepth))))
              pending.best = data;
          } else if (data.move) this.resolve(data);
          else this.finish(data.status, data.errorCode, data.status !== "ok");
        };
        this.worker.onerror = () => {
          if (this.worker === worker && this.pending === activePending) this.finish("error", "worker_error", true);
        };
        this.worker.onmessageerror = () => {
          if (this.worker === worker && this.pending === activePending) this.finish("error", "message_error", true);
        };
        this.worker.postMessage(snapshot);
      } catch { this.finish("error", "worker_unavailable", true); }
    });
  }
  private resolve(result: AiResponse): void {
    const pending = this.pending;
    if (!pending) return;
    clearTimeout(pending.timer); this.pending = null;
    pending.resolve({ ...result, kind: "result" });
  }
  private finish(status: AiResponse["status"], errorCode?: string, stop = false): void {
    const pending = this.pending;
    if (stop) this.stopWorker();
    if (!pending) return;
    const fallback = status !== "cancelled" ? pending.best : null;
    this.resolve({ ...identityOf(pending.request), ...(fallback ?? emptyResult(status)), status, errorCode, kind: "result" });
  }
  private stopWorker(): void {
    if (!this.worker) return;
    this.worker.onmessage = null; this.worker.onerror = null; this.worker.onmessageerror = null;
    this.worker.terminate(); this.worker = null;
  }
  cancelActiveRequest(): void { this.finish("cancelled", undefined, this.pending !== null); }
  dispose(): void { this.cancelActiveRequest(); this.stopWorker(); }
}
